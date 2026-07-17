import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';

export interface OutgoingEmail {
  to: string;
  subject: string;
  body: string;
}

const MAX_ATTEMPTS = 5;

/**
 * SMTP delivery via Nodemailer with a DB-backed outbox.
 *
 * Design contract: enqueue()/send() NEVER throw to the caller. Consultation
 * persistence and confirmation must succeed even when SMTP is down or
 * unconfigured — the email is simply parked in EmailOutbox for later retry
 * (drained by POST /api/cron/email-retry).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  private async buildTransport(): Promise<Transporter | null> {
    const host = await this.config.resolveConfig('SMTP_HOST');
    // The integration API key acts as the "configured" gate as well.
    const apiKey = await this.config.resolveConfig(
      'SMTP_VIA_NODEMAILER_API_KEY',
    );
    if (!host && !apiKey) return null;
    if (!host) return null;

    const port = parseInt(
      (await this.config.resolveConfig('SMTP_PORT')) || '587',
      10,
    );
    const user = await this.config.resolveConfig('SMTP_USER');
    const pass =
      (await this.config.resolveConfig('SMTP_PASS')) || apiKey || undefined;

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
    });
  }

  private async fromAddress(): Promise<string> {
    return (
      (await this.config.resolveConfig('SMTP_FROM')) ||
      (await this.config.resolveConfig('SMTP_USER')) ||
      'no-reply@lebarregroup.com'
    );
  }

  /**
   * Attempt immediate delivery. On any failure (including unconfigured SMTP)
   * the message is persisted to EmailOutbox for later retry. Returns true when
   * the message was delivered synchronously, false when it was queued.
   */
  async send(email: OutgoingEmail): Promise<boolean> {
    try {
      const transport = await this.buildTransport();
      if (!transport) {
        await this.enqueue(email, 'SMTP not configured');
        return false;
      }
      await transport.sendMail({
        from: await this.fromAddress(),
        to: email.to,
        subject: email.subject,
        text: email.body,
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Email send failed, queuing to outbox: ${message}`);
      await this.enqueue(email, message);
      return false;
    }
  }

  /** Park a message in the outbox for later retry. Never throws. */
  async enqueue(email: OutgoingEmail, lastError?: string): Promise<void> {
    try {
      await this.prisma.emailOutbox.create({
        data: {
          to: email.to,
          subject: email.subject,
          body: email.body,
          status: 'PENDING',
          lastError: lastError ?? null,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to enqueue email to outbox: ${message}`);
    }
  }

  /**
   * Drain pending/failed outbox messages. Applies an attempt cap and a simple
   * exponential-backoff gate so a persistently-failing message is retried less
   * often. Returns a summary for the cron endpoint.
   */
  async drainOutbox(): Promise<{
    processed: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const transport = await this.buildTransport();
    const candidates = await this.prisma.emailOutbox.findMany({
      where: { status: { in: ['PENDING', 'FAILED'] }, attempts: { lt: MAX_ATTEMPTS } },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const now = Date.now();

    for (const msg of candidates) {
      // Exponential backoff: wait 2^attempts minutes since last update.
      const backoffMs = Math.pow(2, msg.attempts) * 60_000;
      if (now - msg.updatedAt.getTime() < backoffMs) {
        skipped++;
        continue;
      }

      if (!transport) {
        await this.prisma.emailOutbox.update({
          where: { id: msg.id },
          data: {
            attempts: { increment: 1 },
            status: 'FAILED',
            lastError: 'SMTP not configured',
          },
        });
        failed++;
        continue;
      }

      try {
        await transport.sendMail({
          from: await this.fromAddress(),
          to: msg.to,
          subject: msg.subject,
          text: msg.body,
        });
        await this.prisma.emailOutbox.update({
          where: { id: msg.id },
          data: { status: 'SENT', attempts: { increment: 1 }, lastError: null },
        });
        sent++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await this.prisma.emailOutbox.update({
          where: { id: msg.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: message,
          },
        });
        failed++;
      }
    }

    return { processed: candidates.length, sent, failed, skipped };
  }
}
