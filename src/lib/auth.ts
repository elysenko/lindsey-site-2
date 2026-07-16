import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { UserRole } from '@prisma/client';

// Edge-safe auth primitives: JWT sign/verify via `jose` only. This module must
// NOT import bcryptjs or next/headers so it can be used from middleware (Edge
// runtime). Node-only helpers (password hashing, cookie set/clear) live in
// ./session.ts.

export const SESSION_COOKIE = 'session';

export const DEFAULT_TTL = process.env.JWT_EXPIRES_IN || process.env.JWT_EXP || '1d';

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

/** Convert "1d" / "15m" / "3600" to seconds. Bare number = seconds. */
export function ttlToSeconds(ttl: string): number {
  const m = /^(\d+)\s*([smhd])?$/.exec(ttl.trim());
  if (!m) return 60 * 60 * 24;
  const n = parseInt(m[1], 10);
  switch (m[2]) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      return n;
  }
}

export async function signSession(payload: SessionPayload, ttl: string = DEFAULT_TTL): Promise<string> {
  const seconds = ttlToSeconds(ttl);
  return new SignJWT({ ...payload } as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${seconds}s`)
    .sign(getSecret());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] });
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role as UserRole,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function isAdmin(session: SessionPayload | null): boolean {
  return session?.role === 'ADMIN';
}
