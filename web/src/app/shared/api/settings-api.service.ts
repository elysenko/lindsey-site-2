import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SettingEntry, UpdateSettingsInput } from './models';

/**
 * Admin settings — integration config (Postgres/MinIO/Cal.com/SMTP) with masked
 * values + `configured` flags (`/api/admin/settings`, guarded).
 */
@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly api = inject(ApiService);

  list(): Observable<SettingEntry[]> {
    return this.api.get<SettingEntry[]>('/admin/settings');
  }

  update(input: UpdateSettingsInput): Observable<unknown> {
    return this.api.patch<unknown>('/admin/settings', input);
  }
}
