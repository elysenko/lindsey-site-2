import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InsightsApiService, InsightSummary } from '../../shared/api';
import {
  SeoService,
  breadcrumbLd,
  organizationLd,
} from '../../core/seo.service';

/**
 * Insights index. Paginated list of published posts (`/api/insights`), page
 * driven by a `page` query param. Prev/Next links merge the page param and
 * disable at the collection bounds.
 */
@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="insights-main">
      <header class="intro">
        <p class="eyebrow">thinking</p>
        <h1 data-testid="insights-title">Insights</h1>
        <p class="lede">
          Notes on evidence-led brand strategy — what the research keeps
          teaching us, and what we'd do about it.
        </p>
      </header>

      @if (error()) {
        <p class="muted" data-testid="insights-error">
          Insights are momentarily unavailable — please check back shortly.
        </p>
      } @else if (!loaded()) {
        <p class="muted" aria-busy="true" data-testid="insights-loading">
          Fetching the latest thinking…
        </p>
      } @else if (posts().length === 0) {
        <p class="muted" data-testid="insights-empty">
          New insights are on the way.
        </p>
      } @else {
        <ul class="insight-list" data-testid="insights-list">
          @for (post of posts(); track post.slug) {
            <li>
              <a
                [routerLink]="['/insights', post.slug]"
                [attr.data-testid]="'insight-link-' + post.slug"
              >
                <h2>{{ post.title }}</h2>
                @if (post.publishedAt) {
                  <p class="date">{{ post.publishedAt | date: 'longDate' }}</p>
                }
                <p class="excerpt">{{ post.excerpt }}</p>
              </a>
            </li>
          }
        </ul>

        <nav class="pager" data-testid="insights-pager" aria-label="Insights pagination">
          <a
            class="btn ghost"
            [class.disabled]="currentPage() <= 1"
            [attr.aria-disabled]="currentPage() <= 1"
            [routerLink]="currentPage() <= 1 ? null : []"
            [queryParams]="{ page: currentPage() - 1 }"
            queryParamsHandling="merge"
            data-testid="insights-prev"
          >
            Previous
          </a>
          <span class="page-status" data-testid="insights-page-status">
            Page {{ currentPage() }} of {{ totalPages() }}
          </span>
          <a
            class="btn ghost"
            [class.disabled]="currentPage() >= totalPages()"
            [attr.aria-disabled]="currentPage() >= totalPages()"
            [routerLink]="currentPage() >= totalPages() ? null : []"
            [queryParams]="{ page: currentPage() + 1 }"
            queryParamsHandling="merge"
            data-testid="insights-next"
          >
            Next
          </a>
        </nav>
      }
    </main>
  `,
  styles: [
    `
      main {
        max-width: 1080px;
        margin: 0 auto;
        padding: 2rem 1.25rem 4rem;
        color: #14181f;
      }
      .intro {
        padding: 2rem 0 1rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.85rem;
        color: #6b7280;
        margin: 0 0 0.75rem;
      }
      h1 {
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 1.1;
        margin: 0 0 1rem;
      }
      .lede {
        font-size: 1.15rem;
        color: #374151;
        max-width: 60ch;
      }
      .insight-list {
        list-style: none;
        padding: 0;
        margin: 1.5rem 0;
        display: grid;
        gap: 1rem;
      }
      .insight-list li {
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;
      }
      .insight-list a {
        text-decoration: none;
        color: inherit;
        display: block;
        min-height: 44px;
      }
      .insight-list h2 {
        margin: 0 0 0.25rem;
        font-size: 1.3rem;
      }
      .date {
        color: #6b7280;
        font-size: 0.9rem;
        margin: 0 0 0.5rem;
      }
      .excerpt {
        color: #374151;
        margin: 0;
        max-width: 68ch;
      }
      .pager {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      .page-status {
        color: #6b7280;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        padding: 0.85rem 1.4rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        min-height: 44px;
      }
      .btn.ghost {
        border: 1px solid #d1d5db;
        color: #14181f;
      }
      .btn.disabled {
        opacity: 0.45;
        pointer-events: none;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class InsightsComponent {
  private readonly insightsApi = inject(InsightsApiService);
  private readonly seo = inject(SeoService);

  private readonly _page = signal('1');
  readonly posts = signal<InsightSummary[]>([]);
  readonly totalPages = signal(1);
  readonly error = signal(false);
  readonly loaded = signal(false);

  readonly currentPage = computed(() => {
    const n = Number(this._page());
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  });

  @Input()
  set page(value: string | undefined) {
    this._page.set(value ?? '1');
    this.load();
  }

  private load(): void {
    this.loaded.set(false);
    this.error.set(false);

    this.insightsApi.listPublished(this.currentPage(), 10).subscribe({
      next: (result) => {
        this.posts.set(result.items);
        this.totalPages.set(Math.max(1, result.totalPages));
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      },
    });

    this.seo.apply(
      {
        title: 'Insights',
        description:
          'Notes on evidence-led brand strategy from the LeBarre Group.',
        canonicalPath: '/insights',
      },
      [
        organizationLd(),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
        ]),
      ],
    );
  }
}
