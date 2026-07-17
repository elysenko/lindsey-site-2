import { ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';
import { PrismaService } from '../prisma/prisma.service';
import { RateLimitOptions } from './rate-limit.decorator';

function makeContext(ip = '203.0.113.9'): ExecutionContext {
  const req = { headers: {}, socket: { remoteAddress: ip }, ip };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function build(options: RateLimitOptions | undefined, count: number) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(options),
  } as unknown as Reflector;
  const prisma = {
    rateLimitHit: {
      count: jest.fn().mockResolvedValue(count),
      create: jest.fn().mockResolvedValue({}),
    },
  };
  const guard = new RateLimitGuard(reflector, prisma as unknown as PrismaService);
  return { guard, prisma };
}

const OPTS: RateLimitOptions = {
  action: 'consultation',
  limit: 5,
  windowMinutes: 60,
};

describe('RateLimitGuard sliding window', () => {
  it('allows when no rate-limit metadata is present', async () => {
    const { guard, prisma } = build(undefined, 999);
    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(prisma.rateLimitHit.create).not.toHaveBeenCalled();
  });

  it('allows and records a hit when under the limit', async () => {
    const { guard, prisma } = build(OPTS, 4);
    await expect(guard.canActivate(makeContext())).resolves.toBe(true);
    expect(prisma.rateLimitHit.create).toHaveBeenCalledWith({
      data: { key: '203.0.113.9', action: 'consultation' },
    });
    // The count query is scoped to (key, action) within the window.
    const where = prisma.rateLimitHit.count.mock.calls[0][0].where;
    expect(where.key).toBe('203.0.113.9');
    expect(where.action).toBe('consultation');
    expect(where.createdAt.gte).toBeInstanceOf(Date);
  });

  it('blocks with 429 when the count is at the limit and does not record a hit', async () => {
    const { guard, prisma } = build(OPTS, 5);
    const err = await guard.canActivate(makeContext()).catch((e) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(429);
    expect(prisma.rateLimitHit.create).not.toHaveBeenCalled();
  });
});
