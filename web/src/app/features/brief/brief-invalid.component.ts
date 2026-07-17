import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

/**
 * Friendly 404-style page for unknown or expired brief tokens. Points the
 * visitor back to the consultation flow to start over.
 */
@Component({
  selector: 'app-brief-invalid',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main data-testid="brief-invalid-main">
      <a class="wordmark" routerLink="/" data-testid="brief-invalid-wordmark">
        The LeBarre Group
      </a>

      <section class="panel" data-testid="brief-invalid">
        <p class="eyebrow">brief not found</p>
        <h1>This brief link isn't available</h1>
        <p class="lede">
          The link you followed is invalid or has expired. Brief links are unique
          to each consultation request and can only be used once.
        </p>
        <div class="actions">
          <a class="btn primary" routerLink="/consult" data-testid="brief-invalid-cta">
            Start a new consultation
          </a>
          <a class="btn ghost" routerLink="/" data-testid="brief-invalid-home">
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
export class BriefInvalidComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.apply(
      {
        title: 'Brief not found',
        description: 'This Brand Intelligence Brief link is invalid or has expired.',
      },
      undefined,
    );
  }
}
