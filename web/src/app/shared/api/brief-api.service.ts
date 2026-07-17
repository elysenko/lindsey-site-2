import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SubmitBriefInput } from './models';

/**
 * Brand-brief flow (`GET/POST /api/brief/:token`). Unknown/superseded tokens
 * yield 404 → the `/brief/invalid` UX.
 */
@Injectable({ providedIn: 'root' })
export class BriefApiService {
  private readonly api = inject(ApiService);

  getByToken<T = unknown>(token: string): Observable<T> {
    return this.api.get<T>(`/brief/${encodeURIComponent(token)}`);
  }

  submit<T = unknown>(token: string, input: SubmitBriefInput): Observable<T> {
    return this.api.post<T>(`/brief/${encodeURIComponent(token)}`, input);
  }
}
