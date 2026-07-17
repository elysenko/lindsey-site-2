import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListLeadsDto, LeadSort } from './dto/list-leads.dto';
import {
  UpdateLeadDto,
  EDITABLE_BRIEF_FIELDS,
} from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListLeadsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.LeadWhereInput = {};
    if (query.status) {
      where.leadStatus = query.status as Prisma.LeadWhereInput['leadStatus'];
    }
    if (query.challenge) {
      where.challengeCategories = { has: query.challenge };
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      createdAt: query.sort === LeadSort.OLDEST ? 'asc' : 'desc',
    };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          organization: true,
          email: true,
          serviceInterest: true,
          challengeCategories: true,
          briefStatus: true,
          leadStatus: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        brief: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { email: true } } },
        },
        audits: { orderBy: { editedAt: 'desc' } },
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  /**
   * Apply admin edits to a lead: status change, note append, and brief-field
   * edits. Every changed brief field is recorded in BrandBriefAudit with the
   * original value, the new value, the editing admin, and a timestamp.
   */
  async update(id: string, dto: UpdateLeadDto, adminId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { brief: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const ops: Prisma.PrismaPromise<unknown>[] = [];

    if (dto.leadStatus) {
      ops.push(
        this.prisma.lead.update({
          where: { id },
          data: {
            leadStatus:
              dto.leadStatus as Prisma.LeadUpdateInput['leadStatus'],
          },
        }),
      );
    }

    if (dto.note && dto.note.trim().length > 0) {
      ops.push(
        this.prisma.leadNote.create({
          data: { leadId: id, authorId: adminId, body: dto.note.trim() },
        }),
      );
    }

    if (dto.briefEdits && Object.keys(dto.briefEdits).length > 0) {
      const briefUpdate: Record<string, string> = {};
      const briefCreate: Record<string, string> = {};

      for (const field of EDITABLE_BRIEF_FIELDS) {
        const newValue = dto.briefEdits[field];
        if (newValue === undefined) continue;

        const oldValue = lead.brief
          ? ((lead.brief as unknown as Record<string, string | null>)[field] ??
            null)
          : null;

        if (oldValue === newValue) continue;

        briefUpdate[field] = newValue;
        briefCreate[field] = newValue;

        ops.push(
          this.prisma.brandBriefAudit.create({
            data: {
              leadId: id,
              field,
              oldValue,
              newValue,
              adminId,
            },
          }),
        );
      }

      if (Object.keys(briefUpdate).length > 0) {
        ops.push(
          this.prisma.brandBrief.upsert({
            where: { leadId: id },
            update: briefUpdate,
            create: { leadId: id, ...briefCreate },
          }),
        );
      }
    }

    if (ops.length > 0) {
      await this.prisma.$transaction(ops);
    }

    return this.findOne(id);
  }
}
