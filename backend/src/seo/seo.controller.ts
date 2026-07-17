import { Controller, Get, Header, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { SeoService } from './seo.service';

/**
 * Serves crawler-facing documents at the site root (NOT under the `/api`
 * prefix — these paths are excluded in main.ts and proxied by nginx directly
 * to the backend). Kept out of Swagger since they are not JSON API routes.
 */
@ApiExcludeController()
@Controller()
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  /**
   * Resolve the public origin for absolute URLs. Prefers an explicit
   * SITE_URL env, then the forwarded proto/host set by nginx, then the raw
   * request host.
   */
  private origin(req: Request): string {
    const configured = process.env.SITE_URL?.trim();
    if (configured) return configured.replace(/\/+$/, '');
    const proto =
      (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() ||
      req.protocol ||
      'https';
    const host =
      (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim() ||
      req.headers.host ||
      'localhost';
    return `${proto}://${host}`;
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async sitemap(@Req() req: Request): Promise<string> {
    return this.seo.buildSitemap(this.origin(req));
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots(@Req() req: Request): string {
    return this.seo.buildRobots(this.origin(req));
  }
}
