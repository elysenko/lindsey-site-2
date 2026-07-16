import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validation';
import { verifyPassword, setSessionCookie } from '@/lib/session';
import { withRoute, json, error, clientIp } from '@/lib/http';
import { recordLoginAttempt } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const GENERIC = 'Invalid email or password';

export const POST = withRoute(async (req: Request): Promise<NextResponse> => {
  const body = await req.json().catch(() => ({}));
  const { email, password } = loginSchema.parse(body);
  const ip = clientIp(req);

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  const ok = user ? await verifyPassword(password, user.password) : false;

  await recordLoginAttempt(email, ip, ok);

  if (!user || !ok) {
    return error(GENERIC, 401);
  }

  await setSessionCookie({ userId: user.id, email: user.email, role: user.role });
  return json({ id: user.id, email: user.email, role: user.role }, 200);
});
