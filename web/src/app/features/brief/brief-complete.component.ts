import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

/**
 * Brief submitted confirmation. Nudges the lead to book their call (carrying the
 * token through to the confirmation/scheduler page) and offers a way home.
 */
@Component({
  selector: 'app-brief-complete',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="brief-complete-main">
      <a class="wordmark" routerLink="/" data-testid="brief-complete-wordmark">
        The LeBarre Group
      </a>

      <section class="panel">
        <p class="eyebrow">brief received</p>
        <h1 data-testid="brief-complete-heading">Thank you — your brief is in</h1>
        <p class="lede">
          We've captured your Brand Intelligence Brief. Our next step is a
          conversation to turn it into a defensible strategy.
        </p>

        <div class="actions">
          <a
            class="btn primary"
            [routerLink]="['/consult/confirmation']"
            [queryParams]="{ token: briefToken() }"
            data-testid="complete-book-link"
          >
            Book your call
          </a>
          <a class="btn ghost" routerLink="/" data-testid="complete-home-link">
            Back to home
          </a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      main {
        max-width: 640px;
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
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
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
        border: 1px solid #14181f;
      }
      .btn.ghost {
        color: #14181f;
        border: 1px solid #d1d5db;
      }
    `,
  ],
})
export class BriefCompleteComponent implements OnInit {
  private readonly seo = inject(SeoService);

  readonly briefToken = signal('');

  @Input() set token(v: string) {
    this.briefToken.set(v ?? '');
  }

  ngOnInit(): void {
    this.seo.apply(
      {
        title: 'Brief complete',
        description:
          'Your Brand Intelligence Brief has been submitted to The LeBarre Group.',
      },
      undefined,
    );
  }
}
