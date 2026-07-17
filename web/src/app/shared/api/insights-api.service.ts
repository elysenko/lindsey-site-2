import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  AdminInsight,
  CreateInsightInput,
  InsightDetail,
  InsightSummary,
  Paginated,
  UpdateInsightInput,
} from './models';

/**
 * Insights CMS. Public list/detail read from `/api/insights`; admin CRUD hits
 * the guarded `/api/admin/insights` routes (session cookie required).
 */
@Injectable({ providedIn: 'root' })
export class InsightsApiService {
  private readonly api = inject(ApiService);

  // ── Public ────────────────────────────────────────────────────────────────
  listPublished(page = 1, pageSize = 10): Observable<Paginated<InsightSummary>> {
    return this.api.get<Paginated<InsightSummary>>('/insights', { page, pageSize });
  }

  getBySlug(slug: string): Observable<InsightDetail> {
    return this.api.get<InsightDetail>(`/insights/${encodeURIComponent(slug)}`);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminList(): Observable<AdminInsight[]> {
    return this.api.get<AdminInsight[]>('/admin/insights');
  }

  adminGet(id: string): Observable<AdminInsight> {
    return this.api.get<AdminInsight>(`/admin/insights/${encodeURIComponent(id)}`);
  }

  create(input: CreateInsightInput): Observable<AdminInsight> {
    return this.api.post<AdminInsight>('/admin/insights', input);
  }

  update(id: string, input: UpdateInsightInput): Observable<AdminInsight> {
    return this.api.patch<AdminInsight>(
      `/admin/insights/${encodeURIComponent(id)}`,
      input,
    );
  }
}
