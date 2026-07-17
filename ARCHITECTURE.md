# Architecture

LeBarre Group marketing site, lead funnel, and admin CRM/CMS, built on the
certified Colossus **enterprise** stack: an **Angular 19** SPA served by nginx,
a **NestJS** REST API under `/api`, and **PostgreSQL via Prisma**.

## Topology

```
                 ┌─────────────────────────────────────────────┐
   Browser  ───► │  nginx (port 80)  —  web/                    │
                 │   • serves Angular static build (dist/)      │
                 │   • SPA fallback: try_files → /index.html    │
                 │   • proxies /api, /sitemap.xml, /robots.txt, │
                 │     /health → backend:3000                   │
                 └───────────────┬─────────────────────────────┘
                                 │ (proxied API surfaces)
                 ┌───────────────▼─────────────────────────────┐
                 │  NestJS (port 3000)  —  backend/             │
                 │   • global prefix /api (health/sitemap/      │
                 │     robots excluded)                         │
                 │   • Prisma client singleton                  │
                 └───────────────┬─────────────────────────────┘
                                 │ DATABASE_URL
                 ┌───────────────▼─────────────────────────────┐
                 │  PostgreSQL (+ MinIO, Redis provisioned)     │
                 └─────────────────────────────────────────────┘
```

Everything deploys into a single site namespace. Backing-service hosts, ports,
and credentials (`DATABASE_URL`, `REDIS_URL`, MinIO endpoint/keys) are injected
as environment variables from the `infra-secrets` secret — never hardcoded.

## Frontend — `web/` (Angular 19)

- Standalone-component SPA. `angular.json` project **frontend**, build output
  `dist/frontend/browser`, served by nginx with `baseHref: /{{IMAGE_NAME}}/`.
- **Path-based routing** (`PathLocationStrategy`) so every state is deep-linkable;
  nginx `try_files` handles client-side deep links. URL-addressable states use
  query params (consult `?step=`, faq `?category=`, insights `?page=`,
  admin leads `?status=&challenge=&sort=&page=`) and route params
  (`:slug`/`:id`/`:token`).
- **SEO on the client**: `SeoService` sets `Title`/`Meta` per route and
  `JsonLdService` injects `<script type="application/ld+json">` into `<head>`
  (Organization, Person, Service+OfferCatalog, FAQPage, Article, BreadcrumbList).
  `/sitemap.xml` + `/robots.txt` are served **dynamically by NestJS** (proxied by
  nginx) so they reflect published posts.
- `HttpClient` with a credentials interceptor (httpOnly session cookie).
  Admin routes are protected by `adminGuard`.
- Readiness landmark: the hydrated `app-root` carries `data-testid="app-ready"`,
  which the post-deploy render gate waits for.

## Backend — `backend/` (NestJS + Prisma)

- Global `/api` prefix (excludes `/sitemap.xml`, `/robots.txt`, `/health*`),
  `cookie-parser`, `helmet`, global `ValidationPipe` (class-validator,
  whitelist + transform) and `SanitizePipe`, Swagger at `/api/docs` (backend
  probe path), same-origin CORS.
- **Modules**: `auth` (bcryptjs + JWT httpOnly cookie, admin login/logout,
  `AdminGuard` 401/403 semantics, brute-force lockout → reset email),
  `consultation` (rate-limited lead intake → Lead + `briefToken` → async email),
  `brief` (public brief fetch/submit by token), `leads` (admin CRM: list/detail/
  patch with `BrandBriefAudit`), `insights` (public + admin CMS, ≥1500-word
  enforcement, publish → sitemap lastmod), `content`/`team` (static services/
  faqs/team), `settings` (`SystemSetting` + `resolveConfig` env→DB fallback),
  `email` (Nodemailer + `EmailOutbox` retry), `seo` (dynamic sitemap/robots),
  `health` (`/api/health`, `/api/health/deep` DB ping).
- **Resilient boot**: `PrismaService.onModuleInit` attempts `$connect()` but
  catches failure, logs, and retries with capped exponential backoff in the
  background — the process stays up so `/api/health` returns 200 and
  `/api/health/deep` reports 503 until the DB is reachable.
- **DB**: Prisma schema in `backend/prisma/schema.prisma` (models User, Lead,
  BrandBrief, BrandBriefAudit, LeadNote, TeamMember, InsightsPost, EmailOutbox,
  RateLimitHit, LoginAttempt, SystemSetting). Boot runs `prisma migrate deploy`
  → seed (non-fatal) → `node dist/main.js`. Seed at
  `backend/prisma/seed/seed.js` (plain CommonJS) seeds the admin from
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` and emits `SEED_CRED` lines.

## Integrations

- **Cal.com** — vanilla embed on the consultation confirmation page; degrades
  gracefully (503) when unconfigured.
- **SMTP (Nodemailer)** — admin lead-notification email with `EmailOutbox`
  enqueue + `/api/cron/email-retry` drain when SMTP is down.
- **MinIO** — provisioned and surfaced in `/admin/settings`, not wired to an
  upload flow in Phase 1 (images are URL strings + seeded assets).

## Testing

- **Backend unit** (Jest, `backend/src/**/*.spec.ts`): DTO validation, sanitize,
  rate-limit windows, auth hash/verify + lockout, JSON-LD builders,
  `resolveConfig` fallback.
- **E2E** (Playwright, `tests/e2e/`, `angular_testability` wait strategy):
  consultation funnel, brief flows, admin auth/lockout, lead triage + audit,
  insights CMS + sitemap, settings badges, public JSON-LD pages, FAQ filter,
  insights pagination, SEO endpoints, responsive/CWV.
- **Lighthouse CI** (`lighthouserc.js`): LCP/CLS/TBT budgets against the built
  Angular app served by nginx.

## Design decision — SPA vs SSR

The certified enterprise stack is static-nginx + SPA. SEO is handled with
client-injected JSON-LD (indexed by Google's JS-executing crawler) and
server-rendered `/sitemap.xml`/`/robots.txt`. Angular SSR (`@angular/ssr`) is
the escalation path if stricter non-JS-crawler SEO is later required, but it
would change the serve topology and is intentionally not adopted in Phase 1.
