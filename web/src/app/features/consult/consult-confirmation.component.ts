import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../core/seo.service';

const CAL_URL = 'https://cal.com/lebarre-group/consultation';

/**
 * Post-submission confirmation. Invites the lead to complete their Brand
 * Intelligence Brief (deep-linked with the returned token) and to book a call
 * via a dependency-free Cal.com iframe embed with a graceful fallback link.
 */
@Component({
  selector: 'app-consult-confirmation',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="confirmation-main">
      <a class="wordmark" routerLink="/" data-testid="confirmation-wordmark">
        The LeBarre Group
      </a>

      <header class="intro">
        <p class="eyebrow">thank you</p>
        <h1 data-testid="confirmation-heading">Your consultation is requested</h1>
        <p class="lede">
          We've received your request and will be in touch shortly. Here's how to
          get the most from our conversation.
        </p>
      </header>

      @if (briefToken()) {
        <section class="card" data-testid="confirmation-brief-section">
          <h2>Complete your Brand Intelligence Brief</h2>
          <p>
            A few focused questions help us arrive with sharper thinking. It takes
            about ten minutes.
          </p>
          <a
            class="btn primary"
            [routerLink]="['/brief', briefToken()]"
            data-testid="confirmation-brief-link"
          >
            Start your brief
          </a>
        </section>
      }

      <section class="card" data-testid="confirmation-schedule-section">
        <h2>Schedule your call</h2>
        <p>Pick a time that works for you.</p>
        <div class="embed">
          <iframe
            [src]="calUrl"
            title="Schedule a consultation with The LeBarre Group"
            data-testid="cal-embed"
            loading="lazy"
          ></iframe>
        </div>
        <p class="fallback">
          Trouble seeing the scheduler?
          <a
            [href]="calHref"
            target="_blank"
            rel="noopener"
            data-testid="cal-fallback-link"
          >
            Open the booking page
          </a>
        </p>
      </section>
    </main>
  `,
  styles: [
    `
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 2rem 1.25rem 4rem;
        color: #14181f;
      }
      .wordmark {
        display: inline-block;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-decoration: none;
        color: #14181f;
        margin-bottom: 2rem;
      }
      .eyebrow {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0 0 0.5rem;
      }
      h1 {
        font-size: clamp(1.6rem, 4vw, 2.5rem);
        line-height: 1.15;
        margin: 0 0 0.75rem;
      }
      .lede {
        color: #374151;
        margin: 0 0 2rem;
      }
      .card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .card h2 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
      }
      .card p {
        color: #374151;
        margin: 0 0 1rem;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0.7rem 1.4rem;
        border-radius: 6px;
        font-weight: 600;
        text-decoration: none;
      }
      .btn.primary {
        background: #14181f;
        color: #fff;
      }
      .embed {
        position: relative;
        width: 100%;
        aspect-ratio: 4 / 3;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
      }
      .embed iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
      .fallback {
        margin: 0.75rem 0 0;
        font-size: 0.9rem;
        color: #6b7280;
      }
      .fallback a {
        color: #14181f;
        font-weight: 600;
      }
    `,
  ],
})
export class ConsultConfirmationComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly briefToken = signal<string | undefined>(undefined);
  readonly calHref = CAL_URL;
  readonly calUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    CAL_URL,
  );

  @Input() set token(v: string | undefined) {
    this.briefToken.set(v ? v : undefined);
  }

  ngOnInit(): void {
    this.seo.apply(
      {
        title: 'Consultation requested',
        description:
          'Your consultation request has been received. Complete your Brand Intelligence Brief and schedule your call.',
      },
      undefined,
    );
  }
}
