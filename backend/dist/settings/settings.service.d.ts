import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { SettingEntryDto } from './dto/update-settings.dto';
export interface SettingView {
    key: string;
    label: string;
    group: string;
    secret: boolean;
    configured: boolean;
    source: 'env' | 'db' | null;
    value: string | null;
}
export declare class SettingsService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: AppConfigService);
    private mask;
    list(): Promise<SettingView[]>;
    update(entries: SettingEntryDto[]): Promise<{
        updated: number;
    }>;
}
