import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  SESSION_COOKIE,
  DEFAULT_TTL,
  signSession,
  verifySession,
  ttlToSeconds,
  type SessionPayload,
} from './auth';

// Node-only auth helpers: password hashing (bcryptjs) and cookie management
// (next/headers). Only import this from route handlers / server components —
// never from middleware.

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function setSessionCookie(
  payload: SessionPayload,
  ttl: string = DEFAULT_TTL,
): Promise<void> {
  const token = await signSession(payload, ttl);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ttlToSeconds(ttl),
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/** Read + verify the current session from request cookies (route handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}
