import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { isAdmin, type SessionPayload } from './auth';
import { getSession } from './session';
import { ServiceUnconfiguredError } from './config';

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Format a ZodError into a flat, field-keyed error map for API clients. */
export function zodErrors(err: ZodError): NextResponse {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    (fieldErrors[key] ||= []).push(issue.message);
  }
  return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 });
}

/** Thrown by auth guards; caught by withRoute to produce a 401/403 response. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Require any authenticated user. Throws HttpError(401) otherwise. */
export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new HttpError(401, 'Unauthorized');
  return session;
}

/** Require an ADMIN session. Throws 401 if unauthenticated, 403 if non-admin. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new HttpError(401, 'Unauthorized');
  if (!isAdmin(session)) throw new HttpError(403, 'Forbidden');
  return session;
}

/**
 * Wrap a route handler with uniform error handling: converts ZodError → 400
 * field errors, HttpError → its status, ServiceUnconfiguredError → 503,
 * anything else → 500.
 */
export function withRoute<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof ZodError) return zodErrors(err);
      if (err instanceof HttpError) return error(err.message, err.status);
      if (err instanceof ServiceUnconfiguredError) return error(err.message, 503, { key: err.key });
      console.error('[route] unhandled error:', err);
      return error('Internal server error', 500);
    }
  };
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
