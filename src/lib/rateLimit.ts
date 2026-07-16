import { db } from './db';

/**
 * DB-backed sliding-window rate limiting. Multi-instance safe (state lives in
 * Postgres, not process memory). Two surfaces:
 *   - generic action limiter via RateLimitHit (consultation 5/60min/IP)
 *   - login brute-force tracking via LoginAttempt (10 fails/15min/email)
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds: number;
}

/**
 * Record a hit and check whether `key` has exceeded `limit` within `windowMs`
 * for the given `action`. The current request counts toward the total.
 */
export async function checkRateLimit(
  key: string,
  action: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const since = new Date(Date.now() - windowMs);

  // Record this attempt first so concurrent requests are counted consistently.
  await db.rateLimitHit.create({ data: { key, action } });

  const count = await db.rateLimitHit.count({
    where: { key, action, createdAt: { gte: since } },
  });

  const allowed = count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    limit,
    retryAfterSeconds: allowed ? 0 : Math.ceil(windowMs / 1000),
  };
}

/** Consultation funnel: 5 submissions per 60 minutes per IP. */
export function consultationRateLimit(ip: string): Promise<RateLimitResult> {
  return checkRateLimit(ip, 'consultation', 5, 60 * 60 * 1000);
}

/**
 * Count failed login attempts for an email within the lock window.
 * Does not record — call recordLoginAttempt separately.
 */
export async function countRecentLoginFailures(
  email: string,
  windowMs: number = 15 * 60 * 1000,
): Promise<number> {
  const since = new Date(Date.now() - windowMs);
  return db.loginAttempt.count({
    where: { email: email.toLowerCase(), success: false, createdAt: { gte: since } },
  });
}

export async function recordLoginAttempt(
  email: string,
  ip: string | null,
  success: boolean,
): Promise<void> {
  await db.loginAttempt.create({
    data: { email: email.toLowerCase(), ip: ip ?? undefined, success },
  });
}

export const LOGIN_MAX_FAILURES = 10;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

/** True when the account should be locked (>= max failures in window). */
export async function isLoginLocked(email: string): Promise<boolean> {
  const failures = await countRecentLoginFailures(email, LOGIN_WINDOW_MS);
  return failures >= LOGIN_MAX_FAILURES;
}
