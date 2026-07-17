import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Global marketing header with a responsive nav. Below 768px the links collapse
 * behind a hamburger toggle (MobileNav). Every nav target is a real route so
 * deep links resolve; the toggle is a real <button> with aria-expanded.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="site-header">
      <div class="bar">
        <a class="brand" routerLink="/" data-testid="brand-home">LeBarre Group</a>

        <button
          type="button"
          class="hamburger"
          data-testid="nav-toggle"
          [attr.aria-expanded]="open()"
          aria-controls="primary-nav"
          aria-label="Toggle navigation"
          (click)="open.set(!open())"
        >
          <span></span><span></span><span></span>
        </button>

        <nav
          id="primary-nav"
          class="nav"
          [class.open]="open()"
          data-testid="primary-nav"
          aria-label="Primary"
        >
          <a routerLink="/services" routerLinkActive="active" (click)="open.set(false)">Services</a>
          <a routerLink="/about" routerLinkActive="active" (click)="open.set(false)">About</a>
          <a routerLink="/faq" routerLinkActive="active" (click)="open.set(false)">FAQ</a>
          <a routerLink="/insights" routerLinkActive="active" (click)="open.set(false)">Insights</a>
          <a class="cta" routerLink="/consult" data-testid="header-consult" (click)="open.set(false)">
            Request a consultation
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [
    `
      .site-header {
        border-bottom: 1px solid #e5e7eb;
        background: #fff;
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .bar {
        max-width: 1080px;
        margin: 0 auto;
        padding: 0.75rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .brand {
        font-weight: 700;
        font-size: 1.15rem;
        letter-spacing: -0.01em;
      }
      .nav {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }
      .nav a {
        font-weight: 500;
        color: #374151;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }
      .nav a.active {
        color: #14181f;
        font-weight: 600;
      }
      .nav a.cta {
        background: #14181f;
        color: #fff;
        padding: 0.6rem 1rem;
        border-radius: 6px;
      }
      .hamburger {
        display: none;
        flex-direction: column;
        gap: 5px;
        background: none;
        border: 0;
        padding: 10px;
        cursor: pointer;
        min-height: 44px;
        min-width: 44px;
      }
      .hamburger span {
        width: 22px;
        height: 2px;
        background: #14181f;
      }
      @media (max-width: 768px) {
        .hamburger {
          display: flex;
        }
        .nav {
          display: none;
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.5rem 1.25rem 1rem;
        }
        .nav.open {
          display: flex;
        }
        .nav a {
          padding: 0.5rem 0;
        }
        .nav a.cta {
          margin-top: 0.5rem;
          text-align: center;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  readonly open = signal(false);
}
