import { PrismaService } from '../prisma/prisma.service';
export declare const PLACEHOLDER = "PLACEHOLDER_CONFIGURE_IN_SETTINGS";
export declare class AppConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private clean;
    resolveConfig(key: string): Promise<string | null>;
    resolveEnv(key: string): string | null;
    isConfigured(value: string | null): boolean;
}
