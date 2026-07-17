import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PublicLayoutComponent } from './core/public-layout.component';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { adminGuard } from './admin/admin.guard';

/**
 * Every navigable state has its own URL (deep-linkable): list filters ride
 * query params (`?category=`, `?page=`, `?status=`), and detail views use route
 * params (`:slug`, `:token`, `:id`). Public pages share the marketing chrome;
 * the consult/brief funnel and admin console use their own bare layouts.
 */
export const routes: Routes = [
  // ── Public marketing site ──────────────────────────────────────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, data: { flow: 'home' } },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services.component').then((m) => m.ServicesComponent),
        data: { flow: 'services' },
      },
      {
        path: 'services/:slug',
        loadComponent: () =>
          import('./features/services/service-detail.component').then(
            (m) => m.ServiceDetailComponent,
          ),
        data: { flow: 'service-detail' },
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then((m) => m.AboutComponent),
        data: { flow: 'about' },
      },
      {
        path: 'team/:slug',
        loadComponent: () =>
          import('./features/team/team-detail.component').then((m) => m.TeamDetailComponent),
        data: { flow: 'team-detail' },
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/faq/faq.component').then((m) => m.FaqComponent),
        data: { flow: 'faq' },
      },
      {
        path: 'insights',
        loadComponent: () =>
          import('./features/insights/insights.component').then((m) => m.InsightsComponent),
        data: { flow: 'insights' },
      },
      {
        path: 'insights/:slug',
        loadComponent: () =>
          import('./features/insights/insights-detail.component').then(
            (m) => m.InsightsDetailComponent,
          ),
        data: { flow: 'insights-detail' },
      },
    ],
  },

  // ── Consultation funnel (distraction-free, no global nav) ───────────────────
  {
    path: 'consult',
    loadComponent: () =>
      import('./features/consult/consult.component').then((m) => m.ConsultComponent),
    data: { flow: 'consult' },
  },
  {
    path: 'consult/confirmation',
    loadComponent: () =>
      import('./features/consult/consult-confirmation.component').then(
        (m) => m.ConsultConfirmationComponent,
      ),
    data: { flow: 'consult-confirmation' },
  },

  // ── Brand brief ─────────────────────────────────────────────────────────────
  {
    path: 'brief/invalid',
    loadComponent: () =>
      import('./features/brief/brief-invalid.component').then((m) => m.BriefInvalidComponent),
    data: { flow: 'brief-invalid' },
  },
  {
    path: 'brief/:token/complete',
    loadComponent: () =>
      import('./features/brief/brief-complete.component').then((m) => m.BriefCompleteComponent),
    data: { flow: 'brief-complete' },
  },
  {
    path: 'brief/:token',
    loadComponent: () =>
      import('./features/brief/brief.component').then((m) => m.BriefComponent),
    data: { flow: 'brief' },
  },

  // ── Admin ───────────────────────────────────────────────────────────────────
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/admin-login.component').then((m) => m.AdminLoginComponent),
    data: { flow: 'admin-login' },
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
        data: { flow: 'admin-dashboard' },
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./admin/admin-leads.component').then((m) => m.AdminLeadsComponent),
        data: { flow: 'admin-leads' },
      },
      {
        path: 'leads/:id',
        loadComponent: () =>
          import('./admin/admin-lead-detail.component').then((m) => m.AdminLeadDetailComponent),
        data: { flow: 'admin-lead-detail' },
      },
      {
        path: 'insights',
        loadComponent: () =>
          import('./admin/admin-insights.component').then((m) => m.AdminInsightsComponent),
        data: { flow: 'admin-insights' },
      },
      {
        path: 'insights/new',
        loadComponent: () =>
          import('./admin/admin-insight-edit.component').then((m) => m.AdminInsightEditComponent),
        data: { flow: 'admin-insight-new' },
      },
      {
        path: 'insights/:id/edit',
        loadComponent: () =>
          import('./admin/admin-insight-edit.component').then((m) => m.AdminInsightEditComponent),
        data: { flow: 'admin-insight-edit' },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./admin/admin-settings.component').then((m) => m.AdminSettingsComponent),
        data: { flow: 'admin-settings' },
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
