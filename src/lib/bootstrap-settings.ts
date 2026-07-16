import { db } from './db';
import { KNOWN_SETTING_KEYS, CONFIG_PLACEHOLDER } from './config';

/**
 * Seed SystemSetting rows from environment variables at server startup.
 * Uses `update: {}` so an admin-set DB value is NEVER overwritten by env —
 * env only fills in keys that have no DB row yet. Non-fatal on error.
 */
export async function bootstrapSettingsFromEnv(): Promise<void> {
  try {
    const toSeed = KNOWN_SETTING_KEYS.filter(
      (key) => !!process.env[key] && process.env[key] !== CONFIG_PLACEHOLDER,
    );
    if (toSeed.length === 0) return;

    await Promise.all(
      toSeed.map((key) =>
        db.systemSetting.upsert({
          where: { key },
          update: {}, // preserve any existing admin override
          create: { key, value: process.env[key]! },
        }),
      ),
    );
    console.log(`[bootstrap] seeded ${toSeed.length} system_settings from env`);
  } catch (err) {
    console.warn('[bootstrap] bootstrapSettingsFromEnv failed (non-fatal):', err);
  }
}
