import { db } from './db';

const PLACEHOLDER = 'PLACEHOLDER_CONFIGURE_IN_SETTINGS';

/**
 * Thrown when an integration is requested but neither env nor DB has a
 * usable value. Callers/route handlers should map this to HTTP 503.
 */
export class ServiceUnconfiguredError extends Error {
  status = 503 as const;
  constructor(public key: string) {
    super(`Service not configured: ${key}`);
    this.name = 'ServiceUnconfiguredError';
  }
}

function usable(value: string | null | undefined): value is string {
  return !!value && value !== PLACEHOLDER;
}

/**
 * Resolve a config value with priority:
 *   1. Environment variable (mounted from app-secrets at deploy time)
 *   2. SystemSetting DB row (set via admin settings panel)
 *   3. null — feature unconfigured; callers should return 503
 */
export async function resolveConfig(key: string): Promise<string | null> {
  const envVal = process.env[key];
  if (usable(envVal)) return envVal;

  try {
    const setting = await db.systemSetting.findUnique({ where: { key } });
    if (usable(setting?.value)) return setting!.value;
  } catch {
    // DB unreachable — fall through to null so callers throw 503, not 500.
  }
  return null;
}

/** Like resolveConfig but throws ServiceUnconfiguredError (503) when unset. */
export async function requireConfig(key: string): Promise<string> {
  const value = await resolveConfig(key);
  if (!usable(value)) throw new ServiceUnconfiguredError(key);
  return value;
}

export function isUnconfigured(value: string | null | undefined): boolean {
  return !usable(value);
}

export const CONFIG_PLACEHOLDER = PLACEHOLDER;

/**
 * Env keys surfaced in the admin settings panel. Union of infra service
 * credentials and third-party integration tokens referenced by the plan.
 */
export const KNOWN_SETTING_KEYS = [
  // Postgres
  'DATABASE_URL',
  'POSTGRESQL_API_KEY',
  // MinIO / object storage
  'MINIO_ENDPOINT',
  'MINIO_ROOT_USER',
  'MINIO_ROOT_PASSWORD',
  'MINIO_BUCKET',
  // SMTP (Nodemailer)
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'SMTP_PROVIDER_VIA_NODEMAILER_API_KEY',
  // Cal.com embed
  'NEXT_PUBLIC_CALCOM_LINK',
  'CAL_COM_EMBED_CALCOM_EMBED_REACT_API_KEY',
] as const;

export type KnownSettingKey = (typeof KNOWN_SETTING_KEYS)[number];

export function isKnownSettingKey(key: string): key is KnownSettingKey {
  return (KNOWN_SETTING_KEYS as readonly string[]).includes(key);
}

/** Mask a secret value for display (never return cleartext to the client). */
export function maskValue(value: string | null): string | null {
  if (!usable(value)) return null;
  const v = value!;
  if (v.length <= 4) return '••••';
  return `${'•'.repeat(Math.max(4, v.length - 4))}${v.slice(-4)}`;
}
