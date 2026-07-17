import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SERVICES } from '../content/services.data';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

/**
 * Builds the dynamic sitemap and robots.txt payloads.
 *
 * The sitemap combines static marketing routes with data-driven URLs
 * (service detail pages, team profiles, and PUBLISHED insights posts). A
 * published post's `updatedAt` becomes its `<lastmod>`, so re-publishing an
 * edited article refreshes the sitemap timestamp automatically.
 *
 * Admin routes are intentionally excluded from the sitemap and disallowed in
 * robots.txt — they must never be indexed.
 */
@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  private xmlEscape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private normalizeBase(origin: string): string {
    return origin.replace(/\/+$/, '');
  }

  async buildSitemap(origin: string): Promise<string> {
    const base = this.normalizeBase(origin);
    const entries: SitemapEntry[] = [];

    // Static marketing routes.
    const staticRoutes: Array<[string, string, string]> = [
      ['/', 'weekly', '1.0'],
      ['/services', 'monthly', '0.9'],
      ['/about', 'monthly', '0.7'],
      ['/faq', 'monthly', '0.6'],
      ['/insights', 'weekly', '0.8'],
      ['/consult', 'monthly', '0.9'],
    ];
    for (const [path, changefreq, priority] of staticRoutes) {
      entries.push({ loc: `${base}${path}`, changefreq, priority });
    }

    // Service detail pages (static content data).
    for (const service of SERVICES) {
      entries.push({
        loc: `${base}/services/${service.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
      });
    }

    // Team profile pages.
    const team = await this.prisma.teamMember.findMany({
      select: { slug: true, updatedAt: true },
    });
    for (const member of team) {
      entries.push({
        loc: `${base}/team/${member.slug}`,
        lastmod: member.updatedAt?.toISOString(),
        changefreq: 'yearly',
        priority: '0.5',
      });
    }

    // Published insights posts — updatedAt drives lastmod.
    const posts = await this.prisma.insightsPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
    for (const post of posts) {
      entries.push({
        loc: `${base}/insights/${post.slug}`,
        lastmod: post.updatedAt?.toISOString(),
        changefreq: 'monthly',
        priority: '0.7',
      });
    }

    const urls = entries
      .map((e) => {
        const lastmod = e.lastmod
          ? `\n    <lastmod>${e.lastmod}</lastmod>`
          : '';
        return (
          `  <url>\n` +
          `    <loc>${this.xmlEscape(e.loc)}</loc>` +
          `${lastmod}\n` +
          `    <changefreq>${e.changefreq}</changefreq>\n` +
          `    <priority>${e.priority}</priority>\n` +
          `  </url>`
        );
      })
      .join('\n');

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${urls}\n` +
      `</urlset>\n`
    );
  }

  buildRobots(origin: string): string {
    const base = this.normalizeBase(origin);
    return (
      `User-agent: *\n` +
      `Allow: /\n` +
      `Disallow: /admin\n` +
      `Disallow: /api/\n` +
      `\n` +
      `Sitemap: ${base}/sitemap.xml\n`
    );
  }
}
