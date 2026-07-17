"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const services_data_1 = require("../content/services.data");
let SeoService = class SeoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    xmlEscape(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    normalizeBase(origin) {
        return origin.replace(/\/+$/, '');
    }
    async buildSitemap(origin) {
        const base = this.normalizeBase(origin);
        const entries = [];
        const staticRoutes = [
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
        for (const service of services_data_1.SERVICES) {
            entries.push({
                loc: `${base}/services/${service.slug}`,
                changefreq: 'monthly',
                priority: '0.8',
            });
        }
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
            return (`  <url>\n` +
                `    <loc>${this.xmlEscape(e.loc)}</loc>` +
                `${lastmod}\n` +
                `    <changefreq>${e.changefreq}</changefreq>\n` +
                `    <priority>${e.priority}</priority>\n` +
                `  </url>`);
        })
            .join('\n');
        return (`<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            `${urls}\n` +
            `</urlset>\n`);
    }
    buildRobots(origin) {
        const base = this.normalizeBase(origin);
        return (`User-agent: *\n` +
            `Allow: /\n` +
            `Disallow: /admin\n` +
            `Disallow: /api/\n` +
            `\n` +
            `Sitemap: ${base}/sitemap.xml\n`);
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoService);
//# sourceMappingURL=seo.service.js.map