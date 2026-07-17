import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TeamMember } from './models';

/** Team roster (`GET /api/team`, `GET /api/team/:slug`). */
@Injectable({ providedIn: 'root' })
export class TeamApiService {
  private readonly api = inject(ApiService);

  listTeam(): Observable<TeamMember[]> {
    return this.api.get<TeamMember[]>('/team');
  }

  getMember(slug: string): Observable<TeamMember> {
    return this.api.get<TeamMember>(`/team/${encodeURIComponent(slug)}`);
  }
}
