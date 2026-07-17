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
import { InsightsApiService, InsightDetail } from '../../shared/api';
import { SeoService, articleLd, breadcrumbLd } from '../../core/seo.service';

/**
 * Insight detail. Loads a single published post (`/api/insights/:slug`) and
 * renders its body as paragraphs. Unknown slugs (404) fall through to a
 * graceful not-found state.
 */
@Component({
  selector: 'app-insights-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="insight-detail-main">
      @if (error()) {
        <section class="not-found" data-testid="insight-not-found">
          <h1>We couldn't find that insight</h1>
          <p class="muted">
            This piece may have moved, or the link may be out of date.
          </p>
          <a class="btn ghost" routerLink="/insights" data-testid="insight-back">
            Back to all insights
          </a>
        </section>
      } @else if (!post()) {
        <p class="muted" aria-busy="true" data-testid="insight-detail-loading">
          Loading this insight…
        </p>
      } @else {
        <article>
          <header class="intro">
            <p class="eyebrow">insight</p>
            <h1 data-testid="insight-detail-title">{{ post()!.title }}</h1>
            @if (post()!.publishedAt) {
              <p class="date" data-testid="insight-detail-date">
                {{ post()!.publishedAt | date: 'longDate' }}
              </p>
            }
          </header>

          <div class="body" data-testid="insight-detail-body">
            @for (para of bodyParagraphs(); track $index) {
              <p>{{ para }}</p>
            }
          </div>

          <p>
            <a class="btn ghost" routerLink="/insights" data-testid="insight-detail-back">
              Back to all insights
            </a>
          </p>
        </article>
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
        margin: 0 0 0.5rem;
        max-width: 24ch;
      }
      .date {
        color: #6b7280;
        margin: 0;
      }
      .body {
        max-width: 68ch;
      }
      .body p {
        font-size: 1.1rem;
        color: #374151;
        line-height: 1.75;
      }
      .btn {
        display: inline-block;
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
      .not-found {
        padding: 3rem 0;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class InsightsDetailComponent {
  private readonly insightsApi = inject(InsightsApiService);
  private readonly seo = inject(SeoService);

  private readonly _slug = signal('');
  readonly post = signal<InsightDetail | null>(null);
  readonly error = signal(false);

  readonly bodyParagraphs = computed(() => {
    const body = this.post()?.body ?? '';
    return body.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0);
  });

  @Input()
  set slug(value: string) {
    this._slug.set(value);
    this.load();
  }

  private load(): void {
    const slug = this._slug();
    if (!slug) return;
    this.post.set(null);
    this.error.set(false);

    this.insightsApi.getBySlug(slug).subscribe({
      next: (post) => {
        this.post.set(post);
        this.applySeo(post);
      },
      error: () => this.error.set(true),
    });
  }

  private applySeo(post: InsightDetail): void {
    const description = post.body.replace(/\s+/g, ' ').trim().slice(0, 160);
    this.seo.apply(
      {
        title: post.title,
        description,
        canonicalPath: `/insights/${post.slug}`,
      },
      [
        articleLd(post),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: post.title, path: `/insights/${post.slug}` },
        ]),
      ],
    );
  }
}
