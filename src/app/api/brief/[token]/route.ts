import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { brandBriefSchema, BRIEF_FIELDS } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitize';
import { withRoute, json, error } from '@/lib/http';

export const dynamic = 'force-dynamic';

type Ctx = { params: { token: string } };

export const POST = withRoute(async (req: Request, { params }: Ctx): Promise<NextResponse> => {
  const { token } = params;

  const lead = await db.lead.findUnique({ where: { briefToken: token } });
  // Unknown token OR already-consumed (completed/superseded) → 404.
  if (!lead || lead.briefStatus !== 'PENDING') {
    return error('Brief not found or already completed', 404);
  }

  const body = await req.json().catch(() => ({}));
  const data = brandBriefSchema.parse(body);

  const clean: Record<string, string> = {};
  for (const field of BRIEF_FIELDS) {
    clean[field] = sanitizeText((data as Record<string, string>)[field]);
  }

  // Guard against double-submit races: only transition from PENDING.
  const claimed = await db.lead.updateMany({
    where: { id: lead.id, briefStatus: 'PENDING' },
    data: { briefStatus: 'COMPLETED' },
  });
  if (claimed.count === 0) {
    return error('Brief not found or already completed', 404);
  }

  await db.brandBrief.create({
    data: {
      leadId: lead.id,
      mission: clean.mission,
      vision: clean.vision,
      differentiator: clean.differentiator,
      brandStory: clean.brandStory,
      audiences: clean.audiences,
      brandVoice: clean.brandVoice,
      successDefinition: clean.successDefinition,
      completedAt: new Date(),
    },
  });

  return json({ ok: true, briefStatus: 'COMPLETED' }, 200);
});
