import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validation';
import { verifyPassword, setSessionCookie } from '@/lib/session';
import { withRoute, json, error, clientIp } from '@/lib/http';
import {
  recordLoginAttempt,
  countRecentLoginFailures,
  isLoginLocked,
  LOGIN_MAX_FAILURES,
} from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const GENERIC = 'Invalid email or password';
const LOCK_MSG =
  'Too many failed attempts. This account is temporarily locked; a password-reset email has been sent.';

async function dispatchPasswordReset(email: string): Promise<void> {
  // Best-effort: enqueues to EmailOutbox if SMTP is unavailable.
  await sendEmail(
    email,
    'Password reset requested — LeBarre Group Admin',
    'We detected multiple failed sign-in attempts on your admin account. ' +
      'If this was you, use the password-reset link in your admin console to regain access. ' +
      'If not, no action is needed — your account is locked temporarily for safety.',
  );
}

export const POST = withRoute(async (req: Request): Promise<NextResponse> => {
  const body = await req.json().catch(() => ({}));
  const { email, password } = loginSchema.parse(body);
  const ip = clientIp(req);
  const normalized = email.toLowerCase();

  // Already locked within the window → 429 (do not reveal account existence).
  if (await isLoginLocked(normalized)) {
    return error(LOCK_MSG, 429);
  }

  const user = await db.user.findUnique({ where: { email: normalized } });
  const isAdminUser = user?.role === 'ADMIN';
  const ok = user && isAdminUser ? await verifyPassword(password, user.password) : false;

  await recordLoginAttempt(normalized, ip, ok);

  if (!ok) {
    const failures = await countRecentLoginFailures(normalized);
    if (failures >= LOGIN_MAX_FAILURES) {
      await dispatchPasswordReset(normalized);
      return error(LOCK_MSG, 429);
    }
    return error(GENERIC, 401);
  }

  await setSessionCookie({ userId: user!.id, email: user!.email, role: user!.role });
  return json({ id: user!.id, email: user!.email, role: user!.role }, 200);
});
