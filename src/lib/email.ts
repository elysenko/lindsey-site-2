import nodemailer, { type Transporter } from 'nodemailer';
import { db } from './db';
import { resolveConfig } from './config';

export const EMAIL_MAX_ATTEMPTS = 5;
// Exponential-ish backoff: don't retry a row whose last attempt is newer than this.
export const EMAIL_BACKOFF_MS = 5 * 60 * 1000;

interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  from: string;
}

async function loadSmtpConfig(): Promise<SmtpConfig | null> {
  const host = await resolveConfig('SMTP_HOST');
  if (!host) return null;
  const portStr = (await resolveConfig('SMTP_PORT')) || '587';
  const user = (await resolveConfig('SMTP_USER')) || undefined;
  const pass =
    (await resolveConfig('SMTP_PASSWORD')) ||
    (await resolveConfig('SMTP_PROVIDER_VIA_NODEMAILER_API_KEY')) ||
    undefined;
  const from = (await resolveConfig('SMTP_FROM')) || user || 'no-reply@lebarregroup.com';
  return { host, port: parseInt(portStr, 10) || 587, user, pass, from };
}

function buildTransport(cfg: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
}

/** Low-level send. Throws on transport/config failure. */
async function transmit(to: string, subject: string, body: string): Promise<void> {
  const cfg = await loadSmtpConfig();
  if (!cfg) throw new Error('SMTP not configured');
  const transport = buildTransport(cfg);
  await transport.sendMail({
    from: cfg.from,
    to,
    subject,
    text: body,
    html: `<pre style="font-family:inherit;white-space:pre-wrap">${body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')}</pre>`,
  });
}

/**
 * Attempt to send an email. On ANY failure (misconfig, transport error) the
 * message is enqueued to EmailOutbox for later retry — the caller's flow
 * (e.g. lead capture) must NOT fail because email is down.
 * Returns true if sent immediately, false if enqueued.
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    await transmit(to, subject, body);
    return true;
  } catch (err) {
    await db.emailOutbox.create({
      data: {
        to,
        subject,
        body,
        status: 'PENDING',
        attempts: 0,
        lastError: err instanceof Error ? err.message : String(err),
      },
    });
    return false;
  }
}

/** Explicitly enqueue an email without attempting immediate send. */
export async function enqueueEmail(to: string, subject: string, body: string): Promise<void> {
  await db.emailOutbox.create({
    data: { to, subject, body, status: 'PENDING', attempts: 0 },
  });
}

export interface DrainResult {
  processed: number;
  sent: number;
  failed: number;
  parked: number;
}

/**
 * Drain pending EmailOutbox rows. Respects the attempt cap (rows at/over the
 * cap are marked FAILED and parked) and a backoff window (recently-attempted
 * rows are skipped). Safe to call repeatedly (e.g. from a cron endpoint).
 */
export async function drainOutbox(batchSize = 25): Promise<DrainResult> {
  const backoffCutoff = new Date(Date.now() - EMAIL_BACKOFF_MS);

  const rows = await db.emailOutbox.findMany({
    where: {
      status: 'PENDING',
      attempts: { lt: EMAIL_MAX_ATTEMPTS },
      OR: [{ attempts: 0 }, { updatedAt: { lte: backoffCutoff } }],
    },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  const result: DrainResult = { processed: 0, sent: 0, failed: 0, parked: 0 };

  for (const row of rows) {
    result.processed += 1;
    try {
      await transmit(row.to, row.subject, row.body);
      await db.emailOutbox.update({
        where: { id: row.id },
        data: { status: 'SENT', attempts: row.attempts + 1, lastError: null },
      });
      result.sent += 1;
    } catch (err) {
      const attempts = row.attempts + 1;
      const parked = attempts >= EMAIL_MAX_ATTEMPTS;
      await db.emailOutbox.update({
        where: { id: row.id },
        data: {
          attempts,
          status: parked ? 'FAILED' : 'PENDING',
          lastError: err instanceof Error ? err.message : String(err),
        },
      });
      if (parked) result.parked += 1;
      else result.failed += 1;
    }
  }

  return result;
}
