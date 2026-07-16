import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settingsPatchSchema } from '@/lib/validation';
import {
  KNOWN_SETTING_KEYS,
  isKnownSettingKey,
  maskValue,
  CONFIG_PLACEHOLDER,
} from '@/lib/config';
import { withRoute, json, error, requireAdmin } from '@/lib/http';

export const dynamic = 'force-dynamic';

function usable(v: string | null | undefined): v is string {
  return !!v && v !== CONFIG_PLACEHOLDER;
}

// List all known setting keys with masked effective values + configured flag.
export const GET = withRoute(async (): Promise<NextResponse> => {
  await requireAdmin();

  const dbRows = await db.systemSetting.findMany();
  const dbMap = new Map(dbRows.map((r) => [r.key, r]));

  const keys = new Set<string>([...KNOWN_SETTING_KEYS, ...dbMap.keys()]);

  const settings = Array.from(keys)
    .sort()
    .map((key) => {
      const envVal = process.env[key];
      const dbRow = dbMap.get(key);
      const envGood = usable(envVal);
      const dbGood = usable(dbRow?.value);
      const effective = envGood ? envVal! : dbGood ? dbRow!.value : null;
      const source = envGood ? 'env' : dbGood ? 'db' : null;
      return {
        key,
        configured: !!effective,
        // Never return cleartext — masked hint only.
        value: maskValue(effective),
        source,
        updatedAt: dbRow?.updatedAt ?? null,
      };
    });

  return json({ settings }, 200);
});

// Upsert one or more setting key/value pairs. Only known keys are allowed.
export const PATCH = withRoute(async (req: Request): Promise<NextResponse> => {
  await requireAdmin();
  const body = await req.json().catch(() => null);
  const pairs = settingsPatchSchema.parse(body);

  const unknown = pairs.filter((p) => !isKnownSettingKey(p.key)).map((p) => p.key);
  if (unknown.length > 0) {
    return error(`Unknown setting key(s): ${unknown.join(', ')}`, 400);
  }

  await db.$transaction(
    pairs.map((p) =>
      db.systemSetting.upsert({
        where: { key: p.key },
        update: { value: p.value },
        create: { key: p.key, value: p.value },
      }),
    ),
  );

  // Do not echo values back.
  return json({ ok: true, updated: pairs.map((p) => p.key) }, 200);
});
