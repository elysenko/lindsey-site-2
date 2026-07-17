import { PrismaService } from '../prisma/prisma.service';
export declare class SeoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private xmlEscape;
    private normalizeBase;
    buildSitemap(origin: string): Promise<string>;
    buildRobots(origin: string): string;
}
