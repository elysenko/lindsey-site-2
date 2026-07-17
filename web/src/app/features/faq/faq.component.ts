import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, Faq } from '../../shared/api';
import {
  SeoService,
  breadcrumbLd,
  faqPageLd,
  organizationLd,
} from '../../core/seo.service';

/**
 * FAQ index. Renders the questions from `/api/faqs`, filterable by category via
 * a `category` query param. The full category set is derived once from an
 * unfiltered load and rendered as filter chips (plus an "All" reset).
 */
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="faq-main">
      <header class="intro">
        <p class="eyebrow">answers</p>
        <h1 data-testid="faq-title">Frequently asked questions</h1>
        <p class="lede">
          The questions we hear most, answered plainly. Filter by topic below.
        </p>
      </header>

      @if (categories().length) {
        <nav class="chips" data-testid="faq-chips" aria-label="Filter FAQs by category">
          <a
            class="chip"
            [class.active]="!activeCategory()"
            [routerLink]="[]"
            [queryParams]="{ category: null }"
            queryParamsHandling="merge"
            [attr.data-testid]="!activeCategory() ? 'faq-chip-all-active' : 'faq-chip-all'"
          >
            All
          </a>
          @for (cat of categories(); track cat) {
            <a
              class="chip"
              [class.active]="activeCategory() === cat"
              [routerLink]="[]"
              [queryParams]="{ category: cat }"
              queryParamsHandling="merge"
              [attr.data-testid]="
                activeCategory() === cat
                  ? 'faq-chip-active-' + cat
                  : 'faq-chip-' + cat
              "
            >
              {{ cat }}
            </a>
          }
        </nav>
      }

      @if (error()) {
        <p class="muted" data-testid="faq-error">
          Our FAQs are momentarily unavailable — please check back shortly.
        </p>
      } @else if (!loaded()) {
        <p class="muted" aria-busy="true" data-testid="faq-loading">
          Loading questions…
        </p>
      } @else if (faqs().length === 0) {
        <p class="muted" data-testid="faq-empty">
          No questions in this topic yet.
        </p>
      } @else {
        <dl class="faq-list" data-testid="faq-list">
          @for (faq of faqs(); track faq.question) {
            <div class="faq">
              <dt>{{ faq.question }}</dt>
              <dd>{{ faq.answer }}</dd>
            </div>
          }
        </dl>
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
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin: 1.5rem 0;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 999px;
        text-decoration: none;
        color: #14181f;
        font-weight: 600;
        font-size: 0.95rem;
      }
      .chip.active {
        background: #14181f;
        color: #fff;
        border-color: #14181f;
      }
      .faq-list {
        margin: 0;
      }
      .faq {
        padding: 1.25rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      dt {
        font-weight: 600;
        margin-bottom: 0.4rem;
        font-size: 1.05rem;
      }
      dd {
        margin: 0;
        color: #374151;
        line-height: 1.6;
        max-width: 68ch;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class FaqComponent {
  private readonly content = inject(ContentApiService);
  private readonly seo = inject(SeoService);

  readonly faqs = signal<Faq[]>([]);
  readonly categories = signal<string[]>([]);
  readonly activeCategory = signal<string | null>(null);
  readonly error = signal(false);
  readonly loaded = signal(false);

  private chipsLoaded = false;

  @Input()
  set category(value: string | undefined) {
    this.activeCategory.set(value ?? null);
    this.load();
    this.loadChips();
  }

  private load(): void {
    this.loaded.set(false);
    this.error.set(false);
    const category = this.activeCategory() ?? undefined;

    this.content.listFaqs(category).subscribe({
      next: (faqs) => {
        this.faqs.set(faqs);
        this.loaded.set(true);
        this.applySeo(faqs);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
        this.applySeo([]);
      },
    });
  }

  /** Derive the full category set once, from an unfiltered load. */
  private loadChips(): void {
    if (this.chipsLoaded) return;
    this.chipsLoaded = true;
    this.content.listFaqs().subscribe({
      next: (faqs) => {
        const unique = Array.from(
          new Set(faqs.map((f) => f.category).filter((c) => !!c)),
        ).sort();
        this.categories.set(unique);
      },
      error: () => {
        this.chipsLoaded = false;
      },
    });
  }

  private applySeo(faqs: Faq[]): void {
    this.seo.apply(
      {
        title: 'FAQ',
        description:
          'Answers to the questions we hear most about intelligence-led brand strategy.',
        canonicalPath: '/faq',
      },
      [
        faqPageLd(faqs),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'FAQ', path: '/faq' },
        ]),
        organizationLd(),
      ],
    );
  }
}
