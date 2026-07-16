import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Readiness probe — verifies DB connectivity. Returns 503 when DB is down.
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'up', time: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'down',
        detail: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 503 },
    );
  }
}
