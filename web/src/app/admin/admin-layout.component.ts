import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthApiService } from '../shared/api/auth-api.service';

/**
 * Admin console chrome: a slim sidebar/topbar with links to the CRM and CMS
 * screens plus a logout action. Rendered only inside the adminGuard-protected
 * route tree.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-shell">
      <header class="admin-bar">
        <a class="brand" routerLink="/admin" data-testid="admin-brand">LeBarre · Admin</a>
        <nav class="admin-nav" aria-label="Admin">
          <a routerLink="/admin/leads" routerLinkActive="active" data-testid="admin-nav-leads">Leads</a>
          <a routerLink="/admin/insights" routerLinkActive="active" data-testid="admin-nav-insights">Insights</a>
          <a routerLink="/admin/settings" routerLinkActive="active" data-testid="admin-nav-settings">Settings</a>
        </nav>
        <button type="button" class="logout" data-testid="admin-logout" (click)="logout()">
          Log out
        </button>
      </header>
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .admin-bar {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        padding: 0.75rem 1.25rem;
        background: #14181f;
        color: #fff;
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .brand {
        font-weight: 700;
        color: #fff;
      }
      .admin-nav {
        display: flex;
        gap: 1rem;
        flex: 1;
      }
      .admin-nav a {
        color: #cbd5e1;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }
      .admin-nav a.active {
        color: #fff;
        font-weight: 600;
      }
      .logout {
        background: transparent;
        border: 1px solid #374151;
        color: #fff;
        padding: 0.5rem 0.9rem;
        border-radius: 6px;
        cursor: pointer;
        min-height: 44px;
      }
      .admin-main {
        max-width: 1080px;
        margin: 0 auto;
        padding: 1.5rem 1.25rem 4rem;
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthApiService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/admin/login']),
      error: () => this.router.navigate(['/admin/login']),
    });
  }
}
