import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

/**
 * Guards the admin surface. Public marketing routes, auth screens, and public
 * API endpoints are unprotected. All `/admin/*` pages (except `/admin/login`)
 * require an authenticated ADMIN session:
 *   - unauthenticated  → redirect to /admin/login (401 semantics)
 *   - authenticated non-admin → redirect to /unauthorized (403 semantics)
 *
 * API route handlers under /api/admin/* enforce their own JSON 401/403 so the
 * middleware intentionally does not touch /api/* (avoids redirecting fetches).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only the admin PAGE surface is guarded here.
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match admin pages only; exclude static assets and _next internals.
  matcher: ['/admin/:path*'],
};
