import { describe, it, expect } from 'vitest';
import { signSession, verifySession, isAdmin, ttlToSeconds } from '@/lib/auth';
import type { SessionPayload } from '@/lib/auth';

const payload: SessionPayload = {
  userId: 'user-1',
  email: 'admin@lebarregroup.com',
  role: 'ADMIN',
};

describe('ttlToSeconds', () => {
  it('parses common suffixes', () => {
    expect(ttlToSeconds('30s')).toBe(30);
    expect(ttlToSeconds('15m')).toBe(15 * 60);
    expect(ttlToSeconds('2h')).toBe(2 * 3600);
    expect(ttlToSeconds('1d')).toBe(86400);
  });

  it('treats a bare number as seconds', () => {
    expect(ttlToSeconds('3600')).toBe(3600);
  });

  it('falls back to one day on garbage input', () => {
    expect(ttlToSeconds('nonsense')).toBe(86400);
  });
});

describe('session sign/verify round-trip', () => {
  it('signs and verifies a valid session', async () => {
    const token = await signSession(payload);
    const decoded = await verifySession(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe('ADMIN');
  });

  it('rejects a tampered token', async () => {
    const token = await signSession(payload);
    const tampered = token.slice(0, -2) + (token.endsWith('a') ? 'bb' : 'aa');
    expect(await verifySession(tampered)).toBeNull();
  });

  it('returns null for empty/undefined tokens', async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession('')).toBeNull();
    expect(await verifySession('not.a.jwt')).toBeNull();
  });
});

describe('isAdmin', () => {
  it('is true only for the ADMIN role', () => {
    expect(isAdmin(payload)).toBe(true);
    expect(isAdmin({ ...payload, role: 'USER' as SessionPayload['role'] })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
