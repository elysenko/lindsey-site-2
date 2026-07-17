import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Base URL for the NestJS REST API. All backend routes are served under the
 * global `/api` prefix and proxied by nginx in production (SPA + `/api` on the
 * same origin), so a relative base keeps the client origin-agnostic.
 */
export const API_BASE_URL = '/api';

type ParamValue = string | number | boolean | undefined | null;

/**
 * Thin typed wrapper around HttpClient for the LeBarre backend.
 *
 * Every request rides the credentials interceptor (httpOnly session cookie),
 * so admin calls authenticate transparently. Domain services compose this
 * rather than talking to HttpClient directly.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private buildParams(params?: Record<string, ParamValue>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }

  get<T>(path: string, params?: Record<string, ParamValue>): Observable<T> {
    return this.http.get<T>(`${API_BASE_URL}${path}`, {
      params: this.buildParams(params),
    });
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${API_BASE_URL}${path}`, body ?? {});
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(`${API_BASE_URL}${path}`, body ?? {});
  }
}
