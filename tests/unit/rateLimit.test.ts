import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory stand-in for the Prisma client used by the rate limiter.
interface Row {
  key?: string;
  action?: string;
  email?: string;
  success?: boolean;
  createdAt: Date;
}
const hits: Row[] = [];
const attempts: Row[] = [];

function withinWindow(rows: Row[], where: Record<string, unknown>): number {
  return rows.filter((r) => {
    if (where.key !== undefined && r.key !== where.key) return false;
    if (where.action !== undefined && r.action !== where.action) return false;
    if (where.email !== undefined && r.email !== where.email) return false;
    if (where.success !== undefined && r.success !== where.success) return false;
    const gte = (where.createdAt as { gte?: Date } | undefined)?.gte;
    if (gte && r.createdAt < gte) return false;
    return true;
  }).length;
}

vi.mock('@/lib/db', () => ({
  db: {
    rateLimitHit: {
      create: vi.fn(async ({ data }: { data: Row }) => {
        hits.push({ ...data, createdAt: new Date() });
      }),
      count: vi.fn(async ({ where }: { where: Record<string, unknown> }) => withinWindow(hits, where)),
    },
    loginAttempt: {
      create: vi.fn(async ({ data }: { data: Row }) => {
        attempts.push({ ...data, createdAt: new Date() });
      }),
      count: vi.fn(async ({ where }: { where: Record<string, unknown> }) =>
        withinWindow(attempts, where),
      ),
    },
  },
}));

import {
  consultationRateLimit,
  checkRateLimit,
  recordLoginAttempt,
  countRecentLoginFailures,
  isLoginLocked,
  LOGIN_MAX_FAILURES,
} from '@/lib/rateLimit';

beforeEach(() => {
  hits.length = 0;
  attempts.length = 0;
});

describe('consultation rate limit (5 / 60min / IP)', () => {
  it('allows up to the limit then blocks', async () => {
    const ip = '203.0.113.9';
    const results = [];
    for (let i = 0; i < 6; i++) results.push(await consultationRateLimit(ip));
    expect(results.slice(0, 5).every((r) => r.allowed)).toBe(true);
    expect(results[5].allowed).toBe(false);
    expect(results[5].retryAfterSeconds).toBeGreaterThan(0);
  });

  it('isolates windows by key', async () => {
    for (let i = 0; i < 6; i++) await consultationRateLimit('1.1.1.1');
    const other = await consultationRateLimit('2.2.2.2');
    expect(other.allowed).toBe(true);
  });

  it('reports remaining allowance', async () => {
    const r = await checkRateLimit('k', 'test', 3, 60_000);
    expect(r.remaining).toBe(2);
  });
});

describe('login brute-force tracking', () => {
  it('counts only failed attempts within the window', async () => {
    await recordLoginAttempt('a@b.com', '1.1.1.1', false);
    await recordLoginAttempt('a@b.com', '1.1.1.1', true);
    await recordLoginAttempt('a@b.com', '1.1.1.1', false);
    expect(await countRecentLoginFailures('a@b.com')).toBe(2);
  });

  it('locks after the max failures threshold', async () => {
    for (let i = 0; i < LOGIN_MAX_FAILURES; i++) {
      await recordLoginAttempt('lock@b.com', '1.1.1.1', false);
    }
    expect(await isLoginLocked('lock@b.com')).toBe(true);
    expect(await isLoginLocked('other@b.com')).toBe(false);
  });
});
