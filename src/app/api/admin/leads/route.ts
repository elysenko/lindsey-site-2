import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { leadStatusEnum } from '@/lib/validation';
import { withRoute, json, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

// Paginated, filterable leads list for the admin CRM.
export const GET = withRoute(async (req: Request): Promise<NextResponse> => {
  await requireAdmin();
  const url = new URL(req.url);

  const statusParam = url.searchParams.get('status');
  const challenge = url.searchParams.get('challenge');
  const sort = url.searchParams.get('sort') === 'oldest' ? 'asc' : 'desc';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);

  const where: Prisma.LeadWhereInput = {};
  const parsedStatus = leadStatusEnum.safeParse(statusParam);
  if (parsedStatus.success) where.leadStatus = parsedStatus.data;
  if (challenge) where.challengeCategories = { has: challenge };

  const [total, leads] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { brief: { select: { completedAt: true } } },
    }),
  ]);

  return json(
    { leads, page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
    200,
  );
});
