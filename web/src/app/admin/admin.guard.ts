import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthApiService } from '../shared/api/auth-api.service';

/**
 * Protects the admin area. Calls `/api/admin/me` (httpOnly session cookie); an
 * authenticated ADMIN passes, anything else is redirected to the admin login.
 * The backend enforces the real 401/403 semantics — this guard just keeps
 * unauthenticated users out of admin screens client-side.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthApiService);
  const router = inject(Router);

  return auth.me().pipe(
    map((user) =>
      user?.role === 'ADMIN' ? true : router.createUrlTree(['/admin/login']),
    ),
    catchError(() => of(router.createUrlTree(['/admin/login']))),
  );
};
