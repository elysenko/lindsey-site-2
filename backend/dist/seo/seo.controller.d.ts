import type { Request } from 'express';
import { SeoService } from './seo.service';
export declare class SeoController {
    private readonly seo;
    constructor(seo: SeoService);
    private origin;
    sitemap(req: Request): Promise<string>;
    robots(req: Request): string;
}
