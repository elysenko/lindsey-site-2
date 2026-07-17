import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthedRequest, SESSION_COOKIE, SessionPayload } from './session.types';

/**
 * Admin-only route guard.
 *   - No/invalid session cookie → 401 Unauthorized
 *   - Valid session but role !== ADMIN → 403 Forbidden
 * On success, attaches the decoded payload to req.user.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    let payload: SessionPayload;
    try {
      payload = this.jwt.verify<SessionPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (payload.role !== 'ADMIN') {
      throw new ForbiddenException('Administrator access required');
    }

    req.user = payload;
    return true;
  }
}
