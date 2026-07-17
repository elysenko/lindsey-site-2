import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PLACEHOLDER = 'PLACEHOLDER_CONFIGURE_IN_SETTINGS';

/**
 * Resolves configuration values with a defined priority:
 *   1. Environment variable (set at deploy time)
 *   2. SystemSetting DB row (set via the admin settings panel)
 *   3. null — unconfigured; callers should throw ServiceUnconfiguredError (503)
 *
 * A value equal to the PLACEHOLDER sentinel is treated as unconfigured.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly prisma: PrismaService) {}

  private clean(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value === PLACEHOLDER) return null;
    return value;
  }

  async resolveConfig(key: string): Promise<string | null> {
    const envVal = this.clean(process.env[key]);
    if (envVal) return envVal;

    const row = await this.prisma.systemSetting.findUnique({ where: { key } });
    return this.clean(row?.value);
  }

  /** Synchronous env-only resolution for hot paths (no DB round trip). */
  resolveEnv(key: string): string | null {
    return this.clean(process.env[key]);
  }

  isConfigured(value: string | null): boolean {
    return !!this.clean(value);
  }
}
