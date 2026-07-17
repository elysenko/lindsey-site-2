import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  LeadsApiService,
  LeadStatus,
  LeadSort,
  Paginated,
} from '../shared/api';
import { SeoService } from '../core/seo.service';

interface LeadRow {
  id: string;
  fullName: string;
  organization: string | null;
  email: string;
  serviceInterest: string | null;
  challengeCategories: string[];
  briefStatus: string;
  leadStatus: LeadStatus;
  createdAt: string;
}

const STATUS_OPTIONS: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'WON',
  'LOST',
];

/**
 * CRM leads list with URL-driven filtering/sorting/pagination. Query params
 * bind to inputs via withComponentInputBinding(); filter changes are written
 * back to the URL so views are shareable and back/forward works. Inside
 * AdminLayout.
 */
@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="admin-leads">
      <h1>Leads</h1>

      <div class="filters" data-testid="leads-filters">
        <label>
          <span>Status</span>
          <select
            data-testid="leads-filter-status"
            [value]="statusSig() ?? ''"
            (change)="onStatus($any($event.target).value)"
          >
            <option value="">All</option>
            @for (opt of statusOptions; track opt) {
              <option [value]="opt">{{ opt }}</option>
            }
          </select>
        </label>

        <label>
          <span>Sort</span>
          <select
            data-testid="leads-filter-sort"
            [value]="sortSig() ?? 'newest'"
            (change)="onSort($any($event.target).value)"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      @if (error()) {
        <p class="muted" data-testid="leads-error">
          Leads are momentarily unavailable — please retry.
        </p>
      } @else if (!loaded()) {
        <p class="muted" aria-busy="true" data-testid="leads-loading">
          Loading leads…
        </p>
      } @else if (rows().length === 0) {
        <p class="muted" data-testid="leads-empty">
          No leads match these filters yet.
        </p>
      } @else {
        <table data-testid="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id) {
              <tr
                [routerLink]="['/admin/leads', row.id]"
                [attr.data-testid]="'lead-row-' + row.id"
              >
                <td>{{ row.fullName }}</td>
                <td>{{ row.organization || '—' }}</td>
                <td>{{ row.email }}</td>
                <td>
                  <span class="badge" [attr.data-status]="row.leadStatus">
                    {{ row.leadStatus }}
                  </span>
                </td>
                <td>{{ row.createdAt | date: 'mediumDate' }}</td>
              </tr>
            }
          </tbody>
        </table>

        <div class="pager" data-testid="leads-pager">
          <button
            type="button"
            data-testid="leads-prev"
            [disabled]="pageSig() <= 1"
            (click)="goTo(pageSig() - 1)"
          >
            Prev
          </button>
          <span data-testid="leads-page-indicator">
            Page {{ pageSig() }} of {{ totalPages() }}
          </span>
          <button
            type="button"
            data-testid="leads-next"
            [disabled]="pageSig() >= totalPages()"
            (click)="goTo(pageSig() + 1)"
          >
            Next
          </button>
        </div>
      }
    </section>
  `,
  styles: [
    `
      h1 {
        margin: 0 0 1rem;
      }
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      .filters label span {
        display: block;
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 0.3rem;
      }
      select {
        min-height: 44px;
        padding: 0.4rem 0.6rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 0.75rem 0.6rem;
        border-bottom: 1px solid #e5e7eb;
        font-size: 0.95rem;
      }
      tbody tr {
        cursor: pointer;
      }
      tbody tr:hover {
        background: #f9fafb;
      }
      .badge {
        display: inline-block;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        background: #eef2ff;
        color: #3730a3;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .pager {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1.25rem;
      }
      .pager button {
        min-height: 44px;
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
      }
      .pager button:disabled {
        opacity: 0.5;
        cursor: default;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class AdminLeadsComponent implements OnInit {
  private readonly leadsApi = inject(LeadsApiService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly statusOptions = STATUS_OPTIONS;

  readonly statusSig = signal<string | undefined>(undefined);
  readonly challengeSig = signal<string | undefined>(undefined);
  readonly sortSig = signal<string | undefined>(undefined);
  readonly pageSig = signal(1);

  readonly rows = signal<LeadRow[]>([]);
  readonly totalPages = signal(1);
  readonly loaded = signal(false);
  readonly error = signal(false);

  private initialized = false;

  @Input() set status(v: string | undefined) {
    this.statusSig.set(v || undefined);
    this.reload();
  }

  @Input() set challenge(v: string | undefined) {
    this.challengeSig.set(v || undefined);
    this.reload();
  }

  @Input() set sort(v: string | undefined) {
    this.sortSig.set(v || undefined);
    this.reload();
  }

  @Input() set page(v: string | undefined) {
    this.pageSig.set(Number(v) || 1);
    this.reload();
  }

  ngOnInit(): void {
    this.seo.apply({ title: 'Leads' });
    this.initialized = true;
    this.reload();
  }

  onStatus(value: string): void {
    this.router.navigate([], {
      queryParams: { status: value || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  onSort(value: string): void {
    this.router.navigate([], {
      queryParams: { sort: value || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  goTo(page: number): void {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  private reload(): void {
    if (!this.initialized) return;
    this.loaded.set(false);
    this.error.set(false);
    this.leadsApi
      .list<Paginated<LeadRow>>({
        status: this.statusSig() as LeadStatus | undefined,
        challenge: this.challengeSig(),
        sort: this.sortSig() as LeadSort | undefined,
        page: this.pageSig(),
      })
      .subscribe({
        next: (res) => {
          this.rows.set(res.items);
          this.totalPages.set(res.totalPages || 1);
          this.loaded.set(true);
        },
        error: () => {
          this.error.set(true);
          this.loaded.set(true);
        },
      });
  }
}
