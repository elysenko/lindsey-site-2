import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService, PLACEHOLDER } from '../config/app-config.service';
import { SETTINGS_CATALOG } from './settings.catalog';
import { SettingEntryDto } from './dto/update-settings.dto';

export interface SettingView {
  key: string;
  label: string;
  group: string;
  secret: boolean;
  configured: boolean;
  source: 'env' | 'db' | null;
  /** Masked for secrets; plaintext for non-secret values. Null when unset. */
  value: string | null;
}

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  private mask(value: string): string {
    if (value.length <= 4) return '••••';
    return `${'•'.repeat(Math.min(8, value.length - 2))}${value.slice(-2)}`;
  }

  async list(): Promise<SettingView[]> {
    const rows = await this.prisma.systemSetting.findMany();
    const dbMap = new Map(rows.map((r) => [r.key, r.value]));

    return SETTINGS_CATALOG.map((desc) => {
      const envRaw = process.env[desc.key];
      const envGood = !!envRaw && envRaw !== PLACEHOLDER;
      const dbRaw = dbMap.get(desc.key);
      const dbGood = !!dbRaw && dbRaw !== PLACEHOLDER;

      const effective = envGood ? envRaw! : dbGood ? dbRaw! : null;
      const source: 'env' | 'db' | null = envGood ? 'env' : dbGood ? 'db' : null;

      let display: string | null = null;
      if (effective) {
        display = desc.secret ? this.mask(effective) : effective;
      }

      return {
        key: desc.key,
        label: desc.label,
        group: desc.group,
        secret: desc.secret,
        configured: !!effective,
        source,
        value: display,
      };
    });
  }

  async update(entries: SettingEntryDto[]): Promise<{ updated: number }> {
    const allowed = new Set(SETTINGS_CATALOG.map((d) => d.key));
    for (const e of entries) {
      if (!allowed.has(e.key)) {
        throw new BadRequestException(`Unknown setting key: ${e.key}`);
      }
    }

    await this.prisma.$transaction(
      entries.map((e) =>
        this.prisma.systemSetting.upsert({
          where: { key: e.key },
          update: { value: e.value },
          create: { key: e.key, value: e.value },
        }),
      ),
    );

    return { updated: entries.length };
  }
}
