import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { insightUpdateSchema } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitize';
import { withRoute, json, error, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const PATCH = withRoute(async (req: Request, { params }: Ctx): Promise<NextResponse> => {
  await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const data = insightUpdateSchema.parse(body);

  const post = await db.insightsPost.findUnique({ where: { id: params.id } });
  if (!post) return error('Post not found', 404);

  const update: Prisma.InsightsPostUpdateInput = {};
  if (data.title !== undefined) update.title = sanitizeText(data.title);
  if (data.body !== undefined) update.body = sanitizeText(data.body);

  if (data.status !== undefined) {
    update.status = data.status;
    // Set publishedAt exactly once, on the first transition to PUBLISHED.
    if (data.status === 'PUBLISHED' && !post.publishedAt) {
      update.publishedAt = new Date();
    }
    // Reverting to DRAFT keeps the original publishedAt (do not reset).
  }

  const updated = await db.insightsPost.update({ where: { id: post.id }, data: update });
  return json(updated, 200);
});
