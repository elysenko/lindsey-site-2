import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer" data-testid="site-footer">
      <div class="inner">
        <div class="col">
          <p class="brand">LeBarre Group</p>
          <p class="muted">
            Intelligence-led brand strategy for organizations that need to be the
            obvious choice.
          </p>
        </div>
        <nav class="col" aria-label="Footer">
          <a routerLink="/services">Services</a>
          <a routerLink="/about">About</a>
          <a routerLink="/faq">FAQ</a>
          <a routerLink="/insights">Insights</a>
          <a routerLink="/consult">Request a consultation</a>
        </nav>
      </div>
      <p class="legal">© {{ year }} LeBarre Group. All rights reserved.</p>
    </footer>
  `,
  styles: [
    `
      .site-footer {
        border-top: 1px solid #e5e7eb;
        background: #fff;
        margin-top: 3rem;
      }
      .inner {
        max-width: 1080px;
        margin: 0 auto;
        padding: 2rem 1.25rem 1rem;
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        justify-content: space-between;
      }
      .brand {
        font-weight: 700;
        margin: 0 0 0.5rem;
      }
      .muted {
        color: #6b7280;
        max-width: 40ch;
      }
      .col {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .col a {
        color: #374151;
        min-height: 32px;
      }
      .legal {
        max-width: 1080px;
        margin: 0 auto;
        padding: 1rem 1.25rem 2rem;
        color: #9ca3af;
        font-size: 0.85rem;
      }
    `,
  ],
})
export class FooterComponent {
  readonly year = 2026;
}
