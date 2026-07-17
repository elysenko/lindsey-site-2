import { HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

type PrismaMock = {
  loginAttempt: { count: jest.Mock; create: jest.Mock };
  user: { findUnique: jest.Mock };
};

function build() {
  const prisma: PrismaMock = {
    loginAttempt: { count: jest.fn().mockResolvedValue(0), create: jest.fn() },
    user: { findUnique: jest.fn() },
  };
  const jwt = { sign: jest.fn(() => 'signed.jwt.token') } as unknown as JwtService;
  const email = { enqueue: jest.fn().mockResolvedValue(undefined) } as unknown as EmailService;
  const service = new AuthService(
    prisma as unknown as PrismaService,
    jwt,
    email,
  );
  return { service, prisma, jwt, email };
}

describe('AuthService password hashing', () => {
  it('hashes then verifies a matching password, rejects a wrong one', async () => {
    const { service } = build();
    const hash = await service.hashPassword('correct-horse');
    expect(hash).not.toBe('correct-horse');
    expect(await service.verifyPassword('correct-horse', hash)).toBe(true);
    expect(await service.verifyPassword('wrong', hash)).toBe(false);
  });
});

describe('AuthService.login', () => {
  const adminUser = {
    id: 'u1',
    email: 'admin@lebarregroup.com',
    role: 'ADMIN',
    password: '', // filled per-test
  };

  it('authenticates a valid admin and records a success attempt', async () => {
    const { service, prisma } = build();
    const hash = await service.hashPassword('s3cret');
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, password: hash });

    const result = await service.login(
      'ADMIN@lebarregroup.com',
      's3cret',
      '1.2.3.4',
    );
    expect(result.token).toBe('signed.jwt.token');
    expect(result.user.role).toBe('ADMIN');
    // Email is normalized to lowercase before persistence.
    expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
      data: { email: 'admin@lebarregroup.com', ip: '1.2.3.4', success: true },
    });
  });

  it('rejects a wrong password with a generic error and logs a failure', async () => {
    const { service, prisma } = build();
    const hash = await service.hashPassword('s3cret');
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, password: hash });

    await expect(
      service.login('admin@lebarregroup.com', 'nope', null),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.loginAttempt.create).toHaveBeenCalledWith({
      data: { email: 'admin@lebarregroup.com', ip: null, success: false },
    });
  });

  it('rejects a non-ADMIN user even with the right password', async () => {
    const { service, prisma } = build();
    const hash = await service.hashPassword('s3cret');
    prisma.user.findUnique.mockResolvedValue({
      ...adminUser,
      role: 'USER',
      password: hash,
    });
    await expect(
      service.login('admin@lebarregroup.com', 's3cret', null),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('locks out after >=10 recent failures with 429 and dispatches a reset email', async () => {
    const { service, prisma, email } = build();
    prisma.loginAttempt.count.mockResolvedValue(10);
    prisma.user.findUnique.mockResolvedValue({ ...adminUser, password: 'x' });

    const err = await service
      .login('admin@lebarregroup.com', 'whatever', '9.9.9.9')
      .catch((e) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(429);
    expect(email.enqueue).toHaveBeenCalledTimes(1);
    // A locked-out attempt must not fall through to a normal auth attempt.
    expect(prisma.loginAttempt.create).not.toHaveBeenCalled();
  });
});
