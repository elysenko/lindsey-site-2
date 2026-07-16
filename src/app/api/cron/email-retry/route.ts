import { NextResponse } from 'next/server';
import { withRoute, json, error } from '@/lib/http';
import { drainOutbox } from '@/lib/email';

export const dynamic = 'force-dynamic';

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET || process.env.EMAIL_RETRY_SECRET;
  if (!secret) return false; // fail closed when no secret configured
  const header = req.headers.get('x-cron-secret');
  const auth = req.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined;
  const query = new URL(req.url).searchParams.get('secret');
  return header === secret || bearer === secret || query === secret;
}

// Secret-guarded worker endpoint for the Colossus scheduler.
export const POST = withRoute(async (req: Request): Promise<NextResponse> => {
  if (!isAuthorized(req)) {
    return error('Unauthorized', 401);
  }
  const result = await drainOutbox();
  return json({ ok: true, ...result }, 200);
});
