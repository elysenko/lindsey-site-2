import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Attaches credentials (the httpOnly admin session cookie) to every request
 * targeting our own API. The backend issues a `sameSite=lax` session cookie on
 * `POST /api/admin/login`; without `withCredentials` the browser would neither
 * send nor store it, breaking every guarded admin call.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api') || req.url.startsWith('/trpc')) {
    return next(req.clone({ withCredentials: true }));
  }
  return next(req);
};
