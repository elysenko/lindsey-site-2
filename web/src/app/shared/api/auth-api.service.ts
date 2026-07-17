import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AdminUser, LoginInput } from './models';

/**
 * Admin authentication. The session lives in an httpOnly cookie the browser
 * never exposes to JS, so we mirror auth state in a signal driven by the
 * `/api/admin/*` responses (login → user, `me` → rehydrate, logout → clear).
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiService);

  private readonly _user = signal<AdminUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  login(input: LoginInput): Observable<{ user: AdminUser }> {
    return this.api
      .post<{ user: AdminUser }>('/admin/login', input)
      .pipe(tap((res) => this._user.set(res.user)));
  }

  logout(): Observable<{ ok: true }> {
    return this.api
      .post<{ ok: true }>('/admin/logout')
      .pipe(tap(() => this._user.set(null)));
  }

  /** Rehydrate the current admin from the session cookie (guards/app boot). */
  me(): Observable<AdminUser> {
    return this.api
      .get<AdminUser>('/admin/me')
      .pipe(tap((user) => this._user.set(user)));
  }
}
