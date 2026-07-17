import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthedRequest, SESSION_COOKIE, SessionPayload } from './session.types';

/**
 * Requires any authenticated user (valid session cookie). Retained for future
 * non-admin authenticated actors; admin routes use AdminGuard.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    try {
      req.user = this.jwt.verify<SessionPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
    return true;
  }
}
