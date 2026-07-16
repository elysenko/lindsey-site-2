import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SERVICES } from '@/content/services';
import { SITE_URL } from '@/lib/jsonld';

export const dynamic = 'force-dynamic';

function abs(path: string): string {
  return `${SITE_URL.replace(/\/$/, '')}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: abs('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: abs('/services'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: abs('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: abs('/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: abs('/insights'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: abs('/consult'), lastModified: now, changeFrequency: 'yearly', priority: 0.8 },
  ];

  const serviceEntries: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: abs(`/services/${s.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [posts, team] = await Promise.all([
      db.insightsPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      db.teamMember.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
    dynamicEntries = [
      ...posts.map((p) => ({
        url: abs(`/insights/${p.slug}`),
        lastModified: p.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      ...team.map((m) => ({
        url: abs(`/team/${m.slug}`),
        lastModified: m.updatedAt,
        changeFrequency: 'yearly' as const,
        priority: 0.5,
      })),
    ];
  } catch {
    // DB unavailable at request time — still return the static sitemap.
  }

  return [...staticEntries, ...serviceEntries, ...dynamicEntries];
}
