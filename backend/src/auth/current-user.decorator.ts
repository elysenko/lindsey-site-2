import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthedRequest, SessionPayload } from './session.types';

/** Injects the authenticated session payload attached by AdminGuard/JwtAuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionPayload | undefined => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.user;
  },
);
