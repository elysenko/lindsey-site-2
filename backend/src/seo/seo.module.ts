import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

/**
 * Dynamic SEO surfaces: /sitemap.xml and /robots.txt. Served at the site root
 * (excluded from the global /api prefix in main.ts) and proxied by nginx.
 */
@Module({
  controllers: [SeoController],
  providers: [SeoService],
})
export class SeoModule {}
