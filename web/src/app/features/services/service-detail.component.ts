import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, ServiceDetail } from '../../shared/api';
import {
  SeoService,
  breadcrumbLd,
  faqPageLd,
  organizationLd,
  serviceLd,
} from '../../core/seo.service';

/**
 * Service detail. Loads a single service (`/api/services/:slug`) and renders its
 * outcomes, deliverables, and embedded FAQs, with a consultation CTA. Unknown
 * slugs (404) fall through to a graceful not-found state.
 */
@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="service-detail-main">
      @if (error()) {
        <section class="not-found" data-testid="service-not-found">
          <h1>We couldn't find that service</h1>
          <p class="muted">
            The discipline you're looking for may have moved or been renamed.
          </p>
          <a class="btn ghost" routerLink="/services" data-testid="service-back">
            Back to all services
          </a>
        </section>
      } @else if (!service()) {
        <p class="muted" aria-busy="true" data-testid="service-detail-loading">
          Loading this discipline…
        </p>
      } @else {
        <article>
          <header class="intro">
            <p class="eyebrow">service</p>
            <h1 data-testid="service-detail-title">{{ service()!.name }}</h1>
            <p class="tagline">{{ service()!.tagline }}</p>
            <p class="lede">{{ service()!.summary }}</p>
          </header>

          @if (service()!.outcomes.length) {
            <section data-testid="service-outcomes">
              <h2>Outcomes</h2>
              <ul>
                @for (outcome of service()!.outcomes; track outcome) {
                  <li>{{ outcome }}</li>
                }
              </ul>
            </section>
          }

          @if (service()!.deliverables.length) {
            <section data-testid="service-deliverables">
              <h2>Deliverables</h2>
              <ul>
                @for (item of service()!.deliverables; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
            </section>
          }

          @if (service()!.faqs.length) {
            <section data-testid="service-faqs">
              <h2>Frequently asked</h2>
              <dl>
                @for (faq of service()!.faqs; track faq.question) {
                  <div class="faq">
                    <dt>{{ faq.question }}</dt>
                    <dd>{{ faq.answer }}</dd>
                  </div>
                }
              </dl>
            </section>
          }

          <section class="cta" data-testid="service-detail-cta">
            <h2>Put this discipline to work</h2>
            <a class="btn primary" routerLink="/consult" data-testid="service-cta-consult">
              Request a consultation
            </a>
          </section>
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
        margin: 0 0 0.75rem;
      }
      h2 {
        font-size: 1.4rem;
        margin: 2rem 0 1rem;
      }
      .tagline {
        color: #4b5563;
        font-weight: 600;
        margin: 0 0 0.75rem;
        font-size: 1.1rem;
      }
      .lede {
        font-size: 1.15rem;
        color: #374151;
        max-width: 62ch;
      }
      ul {
        color: #374151;
        line-height: 1.6;
        padding-left: 1.2rem;
      }
      dl {
        margin: 0;
      }
      .faq {
        padding: 1rem 0;
        border-bottom: 1px solid #e5e7eb;
      }
      dt {
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      dd {
        margin: 0;
        color: #374151;
      }
      .cta {
        margin-top: 2.5rem;
        padding: 2rem 0 0;
        border-top: 1px solid #e5e7eb;
      }
      .cta h2 {
        margin: 0 0 1rem;
      }
      .not-found {
        padding: 3rem 0;
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
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class ServiceDetailComponent {
  private readonly content = inject(ContentApiService);
  private readonly seo = inject(SeoService);

  private readonly _slug = signal('');
  readonly service = signal<ServiceDetail | null>(null);
  readonly error = signal(false);

  @Input()
  set slug(value: string) {
    this._slug.set(value);
    this.load();
  }

  private load(): void {
    const slug = this._slug();
    if (!slug) return;
    this.service.set(null);
    this.error.set(false);

    this.content.getService(slug).subscribe({
      next: (service) => {
        this.service.set(service);
        this.applySeo(service);
      },
      error: () => this.error.set(true),
    });
  }

  private applySeo(service: ServiceDetail): void {
    this.seo.apply(
      {
        title: service.name,
        description: service.summary,
        canonicalPath: `/services/${service.slug}`,
      },
      [
        serviceLd(service.name, service.summary, service.outcomes),
        faqPageLd(service.faqs),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: `/services/${service.slug}` },
        ]),
        organizationLd(),
      ],
    );
  }
}
