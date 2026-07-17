import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../shared/api/content-api.service';
import { InsightsApiService } from '../shared/api/insights-api.service';
import { InsightSummary, ServiceOffering } from '../shared/api/models';

/**
 * Marketing home. The hero copy is the approved static content (also the
 * acceptance sentinel strings); the four service disciplines and the latest
 * insights are loaded live from the NestJS API (`/api/services`, `/api/insights`).
 *
 * Live data degrades gracefully: if the API is unreachable the hero and CTAs
 * still render, so the page is never a blank shell.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="home-main">
      <section class="hero" data-testid="home-hero">
        <p class="eyebrow">intelligence-led brand strategy</p>
        <h1 data-testid="home-title">
          brand strategy that earns the room before you enter it
        </h1>
        <p class="lede">
          The LeBarre Group builds intelligence-led brand strategy for
          organizations that need to be the obvious choice — evidence first,
          adjectives never.
        </p>
        <div class="cta-row">
          <a class="btn primary" routerLink="/consult" data-testid="home-cta-consult">
            Request a consultation
          </a>
          <a class="btn ghost" routerLink="/services" data-testid="home-cta-services">
            Explore our disciplines
          </a>
        </div>
      </section>

      <section class="services" data-testid="home-services">
        <h2>four disciplines, one defensible brand</h2>

        @if (servicesError()) {
          <p class="muted" data-testid="services-error">
            Our services are momentarily unavailable — please check back shortly.
          </p>
        } @else if (services().length === 0) {
          <p class="muted" aria-busy="true" data-testid="services-pending">
            Bringing our disciplines into focus…
          </p>
        } @else {
          <ul class="service-grid" data-testid="services-list">
            @for (service of services(); track service.slug) {
              <li class="service-card">
                <a [routerLink]="['/services', service.slug]">
                  <h3>{{ service.name }}</h3>
                  <p class="tagline">{{ service.tagline }}</p>
                  <p class="summary">{{ service.summary }}</p>
                </a>
              </li>
            }
          </ul>
        }
      </section>

      <section class="insights" data-testid="home-insights">
        <h2>Latest thinking</h2>

        @if (insightsError()) {
          <p class="muted" data-testid="insights-error">
            Insights are momentarily unavailable.
          </p>
        } @else if (insightsLoaded() && insights().length === 0) {
          <p class="muted" data-testid="insights-empty">
            New insights are on the way.
          </p>
        } @else if (!insightsLoaded()) {
          <p class="muted" aria-busy="true" data-testid="insights-pending">
            Fetching the latest thinking…
          </p>
        } @else {
          <ul class="insight-list" data-testid="insights-list">
            @for (post of insights(); track post.slug) {
              <li>
                <a [routerLink]="['/insights', post.slug]">
                  <h3>{{ post.title }}</h3>
                  <p>{{ post.excerpt }}</p>
                </a>
              </li>
            }
          </ul>
        }
      </section>
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
      .hero {
        padding: 3rem 0 2rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.85rem;
        color: #6b7280;
        margin: 0 0 0.75rem;
      }
      h1 {
        font-size: clamp(2rem, 5vw, 3.25rem);
        line-height: 1.1;
        margin: 0 0 1rem;
        max-width: 18ch;
      }
      .lede {
        font-size: 1.15rem;
        color: #374151;
        max-width: 60ch;
      }
      .cta-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }
      .btn {
        display: inline-block;
        padding: 0.85rem 1.4rem;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        min-height: 44px;
      }
      .btn.primary {
        background: #14181f;
        color: #fff;
      }
      .btn.ghost {
        border: 1px solid #d1d5db;
        color: #14181f;
      }
      h2 {
        font-size: 1.6rem;
        margin: 2.5rem 0 1.25rem;
      }
      .service-grid {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      .service-card a {
        display: block;
        height: 100%;
        padding: 1.25rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
      }
      .service-card h3 {
        margin: 0 0 0.35rem;
      }
      .tagline {
        color: #4b5563;
        font-weight: 600;
        margin: 0 0 0.5rem;
      }
      .summary {
        color: #6b7280;
        font-size: 0.95rem;
        margin: 0;
      }
      .insight-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 1rem;
      }
      .insight-list a {
        text-decoration: none;
        color: inherit;
      }
      .insight-list h3 {
        margin: 0 0 0.25rem;
      }
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private readonly content = inject(ContentApiService);
  private readonly insightsApi = inject(InsightsApiService);

  readonly services = signal<ServiceOffering[]>([]);
  readonly servicesError = signal(false);

  readonly insights = signal<InsightSummary[]>([]);
  readonly insightsError = signal(false);
  readonly insightsLoaded = signal(false);

  ngOnInit(): void {
    this.content.listServices().subscribe({
      next: (services) => this.services.set(services),
      error: () => this.servicesError.set(true),
    });

    this.insightsApi.listPublished(1, 3).subscribe({
      next: (page) => {
        this.insights.set(page.items);
        this.insightsLoaded.set(true);
      },
      error: () => {
        this.insightsError.set(true);
        this.insightsLoaded.set(true);
      },
    });
  }
}
