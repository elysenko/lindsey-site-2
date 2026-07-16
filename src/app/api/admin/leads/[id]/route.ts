import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leadUpdateSchema, BRIEF_FIELDS, type BriefField } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitize';
import { withRoute, json, error, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

// Fetch full lead detail for the admin CRM.
export const GET = withRoute(async (_req: Request, { params }: Ctx): Promise<NextResponse> => {
  await requireAdmin();
  const lead = await db.lead.findUnique({
    where: { id: params.id },
    include: {
      brief: true,
      notes: { orderBy: { createdAt: 'desc' }, include: { author: { select: { email: true } } } },
      audits: { orderBy: { editedAt: 'desc' } },
    },
  });
  if (!lead) return error('Lead not found', 404);
  return json(lead, 200);
});

// Update leadStatus, append a note, and/or edit brief fields (audited).
export const PATCH = withRoute(async (req: Request, { params }: Ctx): Promise<NextResponse> => {
  const session = await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const data = leadUpdateSchema.parse(body);

  const lead = await db.lead.findUnique({ where: { id: params.id }, include: { brief: true } });
  if (!lead) return error('Lead not found', 404);

  await db.$transaction(async (tx) => {
    if (data.leadStatus) {
      await tx.lead.update({ where: { id: lead.id }, data: { leadStatus: data.leadStatus } });
    }

    if (data.note) {
      await tx.leadNote.create({
        data: { leadId: lead.id, authorId: session.userId, body: sanitizeText(data.note) },
      });
    }

    if (data.briefFields && Object.keys(data.briefFields).length > 0) {
      // Ensure a BrandBrief row exists to hold edited fields.
      let brief = lead.brief;
      if (!brief) {
        brief = await tx.brandBrief.create({ data: { leadId: lead.id } });
      }

      const updates: Record<string, string> = {};
      for (const field of BRIEF_FIELDS) {
        const raw = (data.briefFields as Partial<Record<BriefField, string>>)[field];
        if (raw === undefined) continue;
        const newValue = sanitizeText(raw);
        const oldValue = (brief as Record<string, unknown>)[field] as string | null;

        // Only audit + write when the value actually changes.
        if ((oldValue ?? '') === newValue) continue;

        updates[field] = newValue;
        await tx.brandBriefAudit.create({
          data: {
            leadId: lead.id,
            field,
            oldValue: oldValue ?? null,
            newValue,
            adminId: session.userId,
          },
        });
      }

      if (Object.keys(updates).length > 0) {
        await tx.brandBrief.update({ where: { id: brief.id }, data: updates });
      }
    }
  });

  const updated = await db.lead.findUnique({
    where: { id: lead.id },
    include: { brief: true, notes: { orderBy: { createdAt: 'desc' } }, audits: true },
  });
  return json(updated, 200);
});
