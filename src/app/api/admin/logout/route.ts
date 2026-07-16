import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';
import { withRoute, json } from '@/lib/http';

export const dynamic = 'force-dynamic';

export const POST = withRoute(async (): Promise<NextResponse> => {
  clearSessionCookie();
  return json({ ok: true }, 200);
});
