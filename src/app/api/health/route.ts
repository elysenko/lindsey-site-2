import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Liveness probe — no DB dependency, always fast.
export async function GET() {
  return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
}
