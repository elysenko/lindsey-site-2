import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeadsApiService, Paginated } from '../shared/api';
import { SeoService } from '../core/seo.service';

interface LeadRow {
  id: string;
}

/**
 * Admin landing. Shows a single live headline stat (total leads) and cards that
 * route into the CRM and CMS areas. Renders inside AdminLayout.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="admin-dashboard">
      <h1>Dashboard</h1>

      <div class="stat" data-testid="dashboard-total">
        @if (error()) {
          <span class="muted" data-testid="dashboard-total-error">
            Lead count unavailable
          </span>
        } @else if (total() === null) {
          <span class="muted" aria-busy="true">Counting leads…</span>
        } @else {
          <span class="stat-number">{{ total() }}</span>
          <span class="stat-label">total leads</span>
        }
      </div>

      <div class="cards">
        <a class="card" routerLink="/admin/leads" data-testid="dashboard-link-leads">
          <h2>Leads</h2>
          <p>Triage and qualify consultation requests.</p>
        </a>
        <a class="card" routerLink="/admin/insights" data-testid="dashboard-link-insights">
          <h2>Insights</h2>
          <p>Draft and publish thought-leadership.</p>
        </a>
        <a class="card" routerLink="/admin/settings" data-testid="dashboard-link-settings">
          <h2>Settings</h2>
          <p>Configure integrations and credentials.</p>
        </a>
      </div>
    </section>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 1rem;
      }
      .stat {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        margin-bottom: 2rem;
      }
      .stat-number {
        font-size: 2.5rem;
        font-weight: 700;
      }
      .stat-label,
      .muted {
        color: #6b7280;
      }
      .cards {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }
      .card {
        display: block;
        padding: 1.25rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
        min-height: 44px;
      }
      .card h2 {
        margin: 0 0 0.35rem;
        font-size: 1.15rem;
      }
      .card p {
        margin: 0;
        color: #6b7280;
        font-size: 0.95rem;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private readonly leads = inject(LeadsApiService);
  private readonly seo = inject(SeoService);

  readonly total = signal<number | null>(null);
  readonly error = signal(false);

  ngOnInit(): void {
    this.seo.apply({ title: 'Dashboard' });
    this.leads.list<Paginated<LeadRow>>({ pageSize: 1 }).subscribe({
      next: (page) => this.total.set(page.total),
      error: () => this.error.set(true),
    });
  }
}
