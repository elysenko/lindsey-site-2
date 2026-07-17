import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Guards cron endpoints with a shared secret. The scheduler must present it via
 * the `x-cron-secret` header or `Authorization: Bearer <secret>`.
 */
@Injectable()
export class CronSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      // Fail closed: without a configured secret, cron endpoints are disabled.
      throw new UnauthorizedException('Cron endpoint disabled');
    }

    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['x-cron-secret'];
    const provided =
      (typeof header === 'string' ? header : undefined) ??
      req.headers.authorization?.replace(/^Bearer\s+/i, '');

    if (provided !== secret) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return true;
  }
}
