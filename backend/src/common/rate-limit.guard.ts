import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from './rate-limit.decorator';
import { getClientIp } from './client-ip.util';

/**
 * DB-backed sliding-window rate limiter. Counts RateLimitHit rows for the
 * (key, action) pair inside the window; if the count is at/over the limit it
 * throws 429, otherwise it records a hit and allows the request.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!options) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const key = getClientIp(req);
    const since = new Date(Date.now() - options.windowMinutes * 60_000);

    const count = await this.prisma.rateLimitHit.count({
      where: { key, action: options.action, createdAt: { gte: since } },
    });

    if (count >= options.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again later.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.prisma.rateLimitHit.create({
      data: { key, action: options.action },
    });

    return true;
  }
}
