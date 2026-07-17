import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ConsultationResponse, CreateConsultationInput } from './models';

/**
 * Lead funnel entry point (`POST /api/consultation`). Rate-limited server-side
 * (5/60min/IP → 429). Returns the `briefToken` used to deep-link the confirmation
 * and brand-brief flows.
 */
@Injectable({ providedIn: 'root' })
export class ConsultationApiService {
  private readonly api = inject(ApiService);

  submit(input: CreateConsultationInput): Observable<ConsultationResponse> {
    return this.api.post<ConsultationResponse>('/consultation', input);
  }
}
