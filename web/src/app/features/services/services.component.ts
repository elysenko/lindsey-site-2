import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentApiService, ServiceOffering } from '../../shared/api';
import {
  SeoService,
  breadcrumbLd,
  organizationLd,
} from '../../core/seo.service';

/**
 * Services index. Lists the firm's disciplines from `/api/services`, each card
 * linking through to its detail page, and a closing CTA to the consultation.
 */
@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="services-main">
      <header class="intro">
        <p class="eyebrow">what we do</p>
        <h1 data-testid="services-title">Services</h1>
        <p class="lede">
          Four disciplines that compound into one defensible brand. Each begins
          with evidence and ends with a decision you can stand behind.
        </p>
      </header>

      @if (error()) {
        <p class="muted" data-testid="services-error">
          Our services are momentarily unavailable — please check back shortly.
        </p>
      } @else if (!loaded()) {
        <p class="muted" aria-busy="true" data-testid="services-loading">
          Bringing our disciplines into focus…
        </p>
      } @else if (services().length === 0) {
        <p class="muted" data-testid="services-empty">
          Our disciplines are being refined and will appear here soon.
        </p>
      } @else {
        <ul class="service-grid" data-testid="services-list">
          @for (service of services(); track service.slug) {
            <li class="service-card">
              <a
                [routerLink]="['/services', service.slug]"
                [attr.data-testid]="'service-link-' + service.slug"
              >
                <h2>{{ service.name }}</h2>
                <p class="tagline">{{ service.tagline }}</p>
                <p class="summary">{{ service.summary }}</p>
              </a>
            </li>
          }
        </ul>
      }

      <section class="cta" data-testid="services-cta">
        <h2>Ready to be the obvious choice?</h2>
        <a class="btn primary" routerLink="/consult" data-testid="services-cta-consult">
          Request a consultation
        </a>
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
      .service-grid {
        list-style: none;
        padding: 0;
        margin: 2rem 0;
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
        min-height: 44px;
      }
      .service-card h2 {
        margin: 0 0 0.35rem;
        font-size: 1.25rem;
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
      .cta {
        margin-top: 2.5rem;
        padding: 2rem 0 0;
        border-top: 1px solid #e5e7eb;
      }
      .cta h2 {
        font-size: 1.4rem;
        margin: 0 0 1rem;
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
      .muted {
        color: #6b7280;
      }
    `,
  ],
})
export class ServicesComponent implements OnInit {
  private readonly content = inject(ContentApiService);
  private readonly seo = inject(SeoService);

  readonly services = signal<ServiceOffering[]>([]);
  readonly error = signal(false);
  readonly loaded = signal(false);

  ngOnInit(): void {
    this.seo.apply(
      {
        title: 'Services',
        description:
          'Intelligence-led brand strategy disciplines from the LeBarre Group.',
        canonicalPath: '/services',
      },
      [
        organizationLd(),
        breadcrumbLd([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ]),
      ],
    );

    this.content.listServices().subscribe({
      next: (services) => {
        this.services.set(services);
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      },
    });
  }
}
