import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminInsight, InsightsApiService } from '../shared/api';
import { SeoService } from '../core/seo.service';

/**
 * CMS insights index: every draft + published post with quick access to the
 * editor and a "New insight" action. Inside AdminLayout.
 */
@Component({
  selector: 'app-admin-insights',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-testid="admin-insights">
      <div class="head">
        <h1>Insights</h1>
        <a class="new" routerLink="/admin/insights/new" data-testid="insights-new">
          New insight
        </a>
      </div>

      @if (error()) {
        <p class="muted" data-testid="admin-insights-error">
          Insights are momentarily unavailable — please retry.
        </p>
      } @else if (!loaded()) {
        <p class="muted" aria-busy="true" data-testid="admin-insights-loading">
          Loading insights…
        </p>
      } @else if (posts().length === 0) {
        <p class="muted" data-testid="admin-insights-empty">
          No insights yet. Create your first post.
        </p>
      } @else {
        <table data-testid="admin-insights-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            @for (post of posts(); track post.id) {
              <tr
                [routerLink]="['/admin/insights', post.id, 'edit']"
                [attr.data-testid]="'insight-row-' + post.id"
              >
                <td>{{ post.title }}</td>
                <td>
                  <span class="badge" [attr.data-status]="post.status">
                    {{ post.status }}
                  </span>
                </td>
                <td>{{ post.updatedAt | date: 'medium' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [
    `
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }
      h1 {
        margin: 0;
      }
      .new {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0.55rem 1.1rem;
        background: #14181f;
        color: #fff;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
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
      .badge[data-status='PUBLISHED'] {
        background: #dcfce7;
        color: #166534;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class AdminInsightsComponent implements OnInit {
  private readonly insightsApi = inject(InsightsApiService);
  private readonly seo = inject(SeoService);

  readonly posts = signal<AdminInsight[]>([]);
  readonly loaded = signal(false);
  readonly error = signal(false);

  ngOnInit(): void {
    this.seo.apply({ title: 'Insights' });
    this.insightsApi.adminList().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      },
    });
  }
}
