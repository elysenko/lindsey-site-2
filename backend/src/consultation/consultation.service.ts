import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AppConfigService } from '../config/app-config.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';

@Injectable()
export class ConsultationService {
  private readonly logger = new Logger(ConsultationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: AppConfigService,
  ) {}

  private generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  private async uniqueToken(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const token = this.generateToken();
      const existing = await this.prisma.lead.findUnique({
        where: { briefToken: token },
        select: { id: true },
      });
      if (!existing) return token;
    }
    // Extremely unlikely; fall back to a longer token.
    return randomBytes(48).toString('base64url');
  }

  /**
   * Persist a Lead with a unique brief token, then dispatch an admin
   * notification. Email is fire-and-forget (never blocks/aborts persistence),
   * so the request stays inside the p95 budget and survives SMTP outages.
   */
  async create(
    dto: CreateConsultationDto,
    ip: string | null,
  ): Promise<{ briefToken: string }> {
    const briefToken = await this.uniqueToken();

    const lead = await this.prisma.lead.create({
      data: {
        fullName: dto.fullName,
        organization: dto.organization ?? null,
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone ?? null,
        serviceInterest: dto.serviceInterest ?? null,
        challengeCategories: dto.challengeCategories,
        situationDescription: dto.situationDescription ?? null,
        briefToken,
        ip,
      },
    });

    // Off the critical path — do not await the send result.
    void this.notifyAdmin(lead.id, dto);

    return { briefToken };
  }

  private async notifyAdmin(
    leadId: string,
    dto: CreateConsultationDto,
  ): Promise<void> {
    try {
      const to =
        (await this.config.resolveConfig('LEAD_NOTIFY_EMAIL')) ||
        (await this.config.resolveConfig('ADMIN_EMAIL')) ||
        'admin@lebarregroup.com';

      const body = [
        `New consultation request (lead ${leadId})`,
        ``,
        `Name: ${dto.fullName}`,
        `Organization: ${dto.organization ?? '—'}`,
        `Email: ${dto.email}`,
        `Phone: ${dto.phone ?? '—'}`,
        `Service interest: ${dto.serviceInterest ?? '—'}`,
        `Challenges: ${dto.challengeCategories.join(', ')}`,
        ``,
        `Situation:`,
        dto.situationDescription ?? '—',
      ].join('\n');

      await this.email.send({
        to,
        subject: `New consultation request — ${dto.fullName}`,
        body,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Admin notification failed: ${message}`);
    }
  }
}
