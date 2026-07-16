import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { insightCreateSchema, slugify } from '@/lib/validation';
import { sanitizeText } from '@/lib/sanitize';
import { withRoute, json, error, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

// List posts for the admin CMS.
export const GET = withRoute(async (req: Request): Promise<NextResponse> => {
  await requireAdmin();
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const [total, posts] = await Promise.all([
    db.insightsPost.count(),
    db.insightsPost.findMany({
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { author: { select: { email: true } } },
    }),
  ]);
  return json({ posts, page, total, totalPages: Math.ceil(total / PAGE_SIZE) }, 200);
});

// Create a post. Body must be >= 1500 words (enforced by schema).
export const POST = withRoute(async (req: Request): Promise<NextResponse> => {
  const session = await requireAdmin();
  const body = await req.json().catch(() => ({}));
  const data = insightCreateSchema.parse(body);

  const title = sanitizeText(data.title);
  const slug = data.slug ? slugify(data.slug) : slugify(title);
  if (!slug) return error('Could not derive a valid slug from the title', 400);

  try {
    const post = await db.insightsPost.create({
      data: {
        title,
        slug,
        // Body is long-form prose; strip markup but preserve text.
        body: sanitizeText(data.body),
        status: data.status,
        authorId: session.userId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
    return json(post, 201);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return error('A post with this slug already exists', 409);
    }
    throw err;
  }
});
