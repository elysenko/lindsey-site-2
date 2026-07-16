import { db } from './db';
import type { InsightsPost, TeamMember } from '@prisma/client';

// Server-side data access for public, DB-backed content (team + insights).
// All reads are read-only and safe to call from server components.

export const POSTS_PER_PAGE = 6;

export async function listTeamMembers(): Promise<TeamMember[]> {
  return db.teamMember.findMany({ orderBy: { createdAt: 'asc' } });
}

export async function getTeamMember(slug: string): Promise<TeamMember | null> {
  return db.teamMember.findUnique({ where: { slug } });
}

export interface PostWithAuthor extends InsightsPost {
  author: { email: string };
}

export async function listPublishedPosts(page = 1): Promise<{
  posts: PostWithAuthor[];
  total: number;
  totalPages: number;
  page: number;
}> {
  const where = { status: 'PUBLISHED' as const };
  const [total, posts] = await Promise.all([
    db.insightsPost.count({ where }),
    db.insightsPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      include: { author: { select: { email: true } } },
    }),
  ]);
  return { posts, total, totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)), page };
}

export async function getPublishedPost(slug: string): Promise<PostWithAuthor | null> {
  const post = await db.insightsPost.findUnique({
    where: { slug },
    include: { author: { select: { email: true } } },
  });
  if (!post || post.status !== 'PUBLISHED') return null;
  return post;
}

/** Excerpt for cards: first ~40 words of the body. */
export function excerpt(body: string, words = 40): string {
  const parts = body.trim().split(/\s+/);
  if (parts.length <= words) return body.trim();
  return parts.slice(0, words).join(' ') + '…';
}

/** Estimated reading time in minutes (200 wpm). */
export function readingMinutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).filter(Boolean).length / 200));
}
