import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Faq, ServiceDetail, ServiceOffering } from './models';

/** Public marketing content: services catalog + FAQs (`GET /api/services`, `/api/faqs`). */
@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly api = inject(ApiService);

  listServices(): Observable<ServiceOffering[]> {
    return this.api.get<ServiceOffering[]>('/services');
  }

  getService(slug: string): Observable<ServiceDetail> {
    return this.api.get<ServiceDetail>(`/services/${encodeURIComponent(slug)}`);
  }

  listFaqs(category?: string): Observable<Faq[]> {
    return this.api.get<Faq[]>('/faqs', { category });
  }
}
