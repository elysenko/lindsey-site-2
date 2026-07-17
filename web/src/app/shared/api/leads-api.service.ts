import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ListLeadsQuery, UpdateLeadInput } from './models';

/**
 * Admin CRM — leads triage (`/api/admin/leads`, guarded). Brief-field edits are
 * audited server-side into BrandBriefAudit.
 */
@Injectable({ providedIn: 'root' })
export class LeadsApiService {
  private readonly api = inject(ApiService);

  list<T = unknown>(query: ListLeadsQuery = {}): Observable<T> {
    return this.api.get<T>('/admin/leads', {
      status: query.status,
      challenge: query.challenge,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  get<T = unknown>(id: string): Observable<T> {
    return this.api.get<T>(`/admin/leads/${encodeURIComponent(id)}`);
  }

  update<T = unknown>(id: string, input: UpdateLeadInput): Observable<T> {
    return this.api.patch<T>(`/admin/leads/${encodeURIComponent(id)}`, input);
  }
}
