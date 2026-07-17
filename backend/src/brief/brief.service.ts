import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitBriefDto } from './dto/submit-brief.dto';

@Injectable()
export class BriefService {
  constructor(private readonly prisma: PrismaService) {}

  /** Load a lead by brief token. Unknown or superseded tokens → 404. */
  async getByToken(token: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { briefToken: token },
      include: { brief: true },
    });

    if (!lead || lead.briefStatus === 'SUPERSEDED') {
      throw new NotFoundException('Brief not found');
    }

    return {
      lead: {
        id: lead.id,
        fullName: lead.fullName,
        organization: lead.organization,
        email: lead.email,
        serviceInterest: lead.serviceInterest,
        challengeCategories: lead.challengeCategories,
        briefStatus: lead.briefStatus,
      },
      brief: lead.brief
        ? {
            mission: lead.brief.mission,
            vision: lead.brief.vision,
            differentiator: lead.brief.differentiator,
            brandStory: lead.brief.brandStory,
            audiences: lead.brief.audiences,
            brandVoice: lead.brief.brandVoice,
            successDefinition: lead.brief.successDefinition,
            completedAt: lead.brief.completedAt,
          }
        : null,
    };
  }

  /**
   * Persist the brand brief for a lead and mark it COMPLETED. Idempotent via
   * upsert so a returning visitor can re-save. Unknown/superseded → 404.
   */
  async submit(token: string, dto: SubmitBriefDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { briefToken: token },
      select: { id: true, briefStatus: true },
    });

    if (!lead || lead.briefStatus === 'SUPERSEDED') {
      throw new NotFoundException('Brief not found');
    }

    const now = new Date();
    const data = {
      mission: dto.mission ?? null,
      vision: dto.vision ?? null,
      differentiator: dto.differentiator ?? null,
      brandStory: dto.brandStory ?? null,
      audiences: dto.audiences ?? null,
      brandVoice: dto.brandVoice ?? null,
      successDefinition: dto.successDefinition ?? null,
      completedAt: now,
    };

    await this.prisma.$transaction([
      this.prisma.brandBrief.upsert({
        where: { leadId: lead.id },
        update: data,
        create: { leadId: lead.id, ...data },
      }),
      this.prisma.lead.update({
        where: { id: lead.id },
        data: { briefStatus: 'COMPLETED' },
      }),
    ]);

    return { ok: true, completedAt: now };
  }
}
