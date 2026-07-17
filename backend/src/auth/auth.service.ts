import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SessionPayload } from './session.types';

const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_WINDOW_MIN = 15;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  signSession(payload: SessionPayload): string {
    return this.jwt.sign(payload);
  }

  verifySession(token: string): SessionPayload {
    return this.jwt.verify<SessionPayload>(token);
  }

  private async recentFailures(email: string): Promise<number> {
    const since = new Date(Date.now() - LOCKOUT_WINDOW_MIN * 60_000);
    return this.prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: since } },
    });
  }

  /**
   * Authenticate an admin. Enforces brute-force lockout:
   * ≥10 failures / 15 min / email → 429 and a queued password-reset email.
   * Uses a generic error message to avoid account enumeration.
   */
  async login(
    email: string,
    password: string,
    ip: string | null,
  ): Promise<{ token: string; user: SessionPayload }> {
    const normalizedEmail = email.trim().toLowerCase();

    const failures = await this.recentFailures(normalizedEmail);
    if (failures >= LOCKOUT_THRESHOLD) {
      await this.dispatchResetEmail(normalizedEmail);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message:
            'Too many failed attempts. This account is temporarily locked; check your email for a reset link.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const passwordOk =
      !!user?.password &&
      (await this.verifyPassword(password, user.password));

    if (!user || !passwordOk || user.role !== 'ADMIN') {
      await this.prisma.loginAttempt.create({
        data: { email: normalizedEmail, ip, success: false },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.loginAttempt.create({
      data: { email: normalizedEmail, ip, success: true },
    });

    const payload: SessionPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return { token: this.signSession(payload), user: payload };
  }

  /** Queue a password-reset notification on lockout. Best-effort; never throws. */
  private async dispatchResetEmail(email: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) return; // don't create outbox spam for unknown accounts
      await this.email.enqueue(
        {
          to: email,
          subject: 'LeBarre Group — account temporarily locked',
          body:
            'Your admin account was temporarily locked after multiple failed sign-in attempts. ' +
            'If this was not you, no action is required — the lock lifts automatically in 15 minutes. ' +
            'To reset your password, contact your administrator.',
        },
        'lockout reset dispatch',
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Reset email dispatch failed: ${message}`);
    }
  }
}
