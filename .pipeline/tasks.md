# Pipeline Task Decomposition

## Summary
The LeBarre Group platform is a marketing site + lead-generation funnel + admin CRM/CMS, rebuilt on the certified Colossus enterprise stack: an Angular 19 SPA (`web/`) served by nginx, a NestJS REST API (`backend/`) mounted under `/api`, and Prisma/PostgreSQL for persistence. It ports all domain logic, schema, and content from a non-deployable Next.js reference scaffold. Public visitors browse services, team, FAQs, and insights, then submit a 2-step consultation request that creates a Lead + brief token; admins triage leads, edit/audit brand briefs, publish long-form insights, and configure integration credentials. SEO (JSON-LD, dynamic sitemap/robots) and backing-service integrations (Cal.com, SMTP, PostgreSQL, MinIO) are first-class.

## Surface contract

### Public routes (web)
- `/` — home (hero, services overview, philosophy, social proof, trust logos, testimonial + CTA)
- `/services` — services listing (ServiceCard grid)
- `/services/:slug` — service detail (embedded FAQ + CTA)
- `/about` — about
- `/team/:slug` — team member detail (Person JSON-LD)
- `/faq?category=` — FAQ (category filter, FAQPage JSON-LD)
- `/insights?page=` — insights list (paginated)
- `/insights/:slug` — insight article (Article JSON-LD)
- `/consult?step=` — distraction-free 2-step consultation form (no global nav)
- `/consult-confirmation?token=` — thank-you + brief invite + Cal.com CalendarEmbed
- `/brief/:token` — brand brief form
- `/brief/:token/complete` — brief completion
- `/brief/invalid` — 404 UX for unknown/superseded tokens
- `/sitemap.xml`, `/robots.txt` — proxied to backend

### Auth routes (web) — full_auth model
- `/login`, `/signup`, logout — main-app user auth
- `/admin/login` — admin login

### Admin routes (web, adminGuard)
- `/admin` — dashboard
- `/admin/leads?status=&challenge=&sort=&page=` — leads list
- `/admin/leads/:id` — lead detail (brief view/edit, notes, status)
- `/admin/insights`, `/admin/insights/new`, `/admin/insights/:id/edit` — CMS
- `/admin/settings` — configured/unconfigured badges + placeholder banner

### API endpoints (backend, `/api` prefix except sitemap/robots)
- Auth: `POST /api/admin/login`, `POST /api/admin/logout`; user `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`
- Consultation: `POST /api/consultation` → `{ briefToken }`
- Brief: `GET /api/brief/:token`, `POST /api/brief/:token`
- Admin leads: `GET /api/admin/leads`, `GET /api/admin/leads/:id`, `PATCH /api/admin/leads/:id`
- Insights: `GET /api/insights`, `GET /api/insights/:slug`, `POST /api/admin/insights`, `PATCH /api/admin/insights/:id`
- Team: `GET /api/team`, `GET /api/team/:slug`
- Content: `GET /api/services`, `GET /api/faqs`
- Settings: `GET /api/admin/settings`, `PATCH /api/admin/settings`
- Cron: `POST /api/cron/email-retry` (secret-guarded)
- SEO: `GET /sitemap.xml`, `GET /robots.txt`
- Health: `GET /api/health`, `GET /api/health/deep`

### Entities
User, Lead, BrandBrief, BrandBriefAudit, LeadNote, TeamMember, InsightsPost, EmailOutbox, RateLimitHit, LoginAttempt, SystemSetting. Enums: UserRole, LeadStatus, BriefStatus, PostStatus, EmailStatus.

## db_agent tasks
- [ ] Move/port `prisma/schema.prisma` into `backend/prisma/schema.prisma` verbatim; remove the `pothos` generator (tRPC/Pothos not used); keep the PostgreSQL datasource on `DATABASE_URL`.
- [ ] Define models: `User`, `Lead`, `BrandBrief`, `BrandBriefAudit`, `LeadNote`, `TeamMember`, `InsightsPost`, `EmailOutbox`, `RateLimitHit`, `LoginAttempt`, `SystemSetting`.
- [ ] Define enums `LeadStatus`, `BriefStatus`, `PostStatus`, `EmailStatus` matching reference values.
- [ ] Add `enum UserRole { ADMIN USER }` and give `User` a `role UserRole @default(USER)` field (full_auth model).
- [ ] Ensure `User` has unique email + hashed-password fields to support admin + user auth.
- [ ] `Lead` model must carry a unique `briefToken` (crypto-random), `leadStatus`, service interest, challenge categories, and situation free-text; relate `LeadNote` and `BrandBrief`.
- [ ] `BrandBrief` carries `briefStatus` (BriefStatus), `completedAt`, and editable brief fields; `BrandBriefAudit` records `adminId`, timestamp, and preserved original values on edits.
- [ ] `InsightsPost` carries `slug`, `status` (PostStatus), body, `updatedAt` (drives sitemap lastmod).
- [ ] `RateLimitHit` (sliding-window rate limiting) and `LoginAttempt` (brute-force lockout) models with fields needed for windowed queries by IP/email.
- [ ] Add `SystemSetting` model — `key String @id`, `value String`, `updatedAt DateTime @updatedAt` (admin settings store for spec_deployments postgresql, minio, llm).
- [ ] Regenerate initial migration under `backend/prisma/migrations/**`; wire `prisma migrate deploy` into the backend Dockerfile boot CMD.
- [ ] Port `prisma/seed.js` into `backend/prisma/seed/seed.js`: seed admin `User` (ADMIN role) from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, TeamMembers, and optional Insights/services content; keep seed non-fatal on boot.

## backend_agent tasks
- [ ] Create NestJS project config: `backend/nest-cli.json`, `backend/package.json`, `backend/tsconfig*.json`, `backend/Dockerfile` (Node 20 alpine; `prisma generate` → `nest build`; boot `prisma migrate deploy` → seed (non-fatal) → `node dist/main.js`).
- [ ] `backend/src/main.ts`: global prefix `/api` excluding `/sitemap.xml`, `/robots.txt`, `/api/health*`; `cookie-parser`, `helmet`, global `ValidationPipe` (whitelist+transform), global `SanitizePipe`, Swagger at `/api/docs`, same-origin CORS.
- [ ] `app.module.ts`, `prisma/prisma.module.ts`, `prisma/prisma.service.ts` (client singleton).
- [ ] `common/sanitize.pipe.ts` (strip HTML/script on all free-text via sanitize-html/isomorphic-dompurify) and `common/rate-limit.guard.ts` (DB sliding-window via `RateLimitHit`); DTOs with `class-validator`.
- [ ] Auth module `auth/`: `auth.service.ts` (bcryptjs hash/verify, jose/`@nestjs/jwt` httpOnly signed session cookie), `admin.controller.ts` (`POST /api/admin/login`, `POST /api/admin/logout`), `jwt-auth.guard.ts`, `admin.guard.ts` (no session→401, non-ADMIN session→403), generic "Invalid email or password".
- [ ] User auth flows (full_auth): `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`; first user created via signup gets `ADMIN` role, subsequent users get `USER`; protect all non-public app routes; admin access enforced via role check on the `/api/admin` route group.
- [ ] Admin guard middleware always protects the `/api/admin/*` route group; admin can always log in via `/api/admin/login`.
- [ ] Brute-force lock: ≥10 failed logins/15min/email → 429 and queue a password-reset email to the outbox (no reset-completion endpoint in Phase 1).
- [ ] Consultation `consultation/`: `POST /api/consultation` — rate-limit guard (5/60min/IP → 429) → validate DTO (name, organization, email format, service interest, ≥1 challenge category, situation) → sanitize → persist `Lead` + unique `briefToken` → enqueue/send admin email off critical path → return `{ briefToken }` (persist+confirm even on SMTP failure; keep p95<1000ms).
- [ ] Brief `brief/`: `GET /api/brief/:token` (valid→lead+brief; unknown/superseded→404), `POST /api/brief/:token` (persist `BrandBrief`, set `briefStatus=COMPLETED`, `completedAt`).
- [ ] Admin leads `leads/`: `GET /api/admin/leads` (paginated; filter `status`, `challenge`, `sort`), `GET /api/admin/leads/:id`, `PATCH /api/admin/leads/:id` (leadStatus, notes via `LeadNote`, brief-field edits → write `BrandBriefAudit` with adminId+timestamp preserving originals).
- [ ] Insights `insights/`: public `GET /api/insights`, `GET /api/insights/:slug`; admin `POST /api/admin/insights`, `PATCH /api/admin/insights/:id` (enforce ≥1500-word body; publish touches `updatedAt` for sitemap lastmod).
- [ ] Team/content: `team/` `GET /api/team`, `GET /api/team/:slug`; `content/` static `services.ts` + `faqs.ts` served via `GET /api/services`, `GET /api/faqs` (≥15 Q&A, ≥3 per service).
- [ ] Settings `settings/`: `GET /api/admin/settings` (list postgresql, minio, llm + integration keys with masked values + configured flag), `PATCH /api/admin/settings` (upsert `SystemSetting`, admin role required).
- [ ] `lib/config.ts` / `config.service.ts` `resolveConfig(key)`: read `process.env[key]` first; if value equals `PLACEHOLDER_CONFIGURE_IN_SETTINGS` or is absent, read from `SystemSetting` DB row; return null if neither is set.
- [ ] Email `email/email.service.ts` (Nodemailer send + `EmailOutbox` enqueue on failure) and `cron/email-retry.controller.ts` (`POST /api/cron/email-retry`, secret-guarded, backoff + attempt cap).
- [ ] SEO `seo/seo.controller.ts`: `GET /sitemap.xml` (dynamic — published posts + static pages, lastmod/changefreq/canonical), `GET /robots.txt` (allow all, disallow `/admin`, reference sitemap).
- [ ] Health `health/`: `GET /api/health`, `GET /api/health/deep` (DB ping).
- [ ] Integration client `lib/integrations/cal-com-embed.ts` — calls `resolveConfig('CAL_COM_EMBED_API_KEY')`; throws `ServiceUnconfiguredError` (503) if null/placeholder; exports the typed helper the confirmation-page booking widget needs (graceful 503 when unconfigured).
- [ ] Integration client `lib/integrations/smtp-via-nodemailer.ts` — calls `resolveConfig('SMTP_VIA_NODEMAILER_API_KEY')`; throws `ServiceUnconfiguredError` (503) if null/placeholder; exports the typed transport used by `email.service.ts` for admin lead notifications + outbox drain.
- [ ] Integration client `lib/integrations/postgresql.ts` — calls `resolveConfig('POSTGRESQL_API_KEY')` (alias surfaced alongside `DATABASE_URL`); throws `ServiceUnconfiguredError` (503) if null/placeholder; exports typed connectivity/status helper.
- [ ] Integration client `lib/integrations/minio.ts` — calls `resolveConfig('MINIO_API_KEY')`; throws `ServiceUnconfiguredError` (503) if null/placeholder; exports typed client stub (provisioned, surfaced in settings, not wired to an upload flow in Phase 1).
- [ ] Include each integration's env keys (`CAL_COM_EMBED_API_KEY`, `SMTP_VIA_NODEMAILER_API_KEY`, `POSTGRESQL_API_KEY`, `MINIO_API_KEY`) in the `GET /api/admin/settings` response alongside service credential keys so the admin settings UI shows them.

## ui_agent tasks
- [ ] Create Angular 19 project config: `web/angular.json`, `web/package.json`, `web/tsconfig*.json`, `web/src/main.ts`, `web/src/index.html` (`data-testid="app-ready"` sentinel + preloaded fonts for CLS), `web/src/styles.scss`, `web/Dockerfile.frontend`, `web/nginx.conf` (SPA `try_files` fallback; proxy `/api`, `/sitemap.xml`, `/robots.txt`).
- [ ] `app.config.ts` (provideRouter with `PathLocationStrategy`, provideHttpClient with credentials interceptor), `app.routes.ts`, `app.component.ts`.
- [ ] Layout `core/`: standalone `Header`, `MobileNav` (hamburger ≤768px), `Footer`; nav shows an admin section only to admins (full_auth); nav toggles login/signup vs logout by auth state.
- [ ] Move `public/logos/*.svg`, `public/logo*.svg`, `public/avatar-placeholder.svg` into `web/src/assets/` and reference them from components.
- [ ] Public pages: `home` (hero, services overview, philosophy, social proof, trust logos, testimonial adjacent to CTA), `services`, `service-detail` (`/services/:slug`, embedded FAQ + CTA), `about`, `team-detail` (`/team/:slug`), `faq` (`/faq?category=`), `insights` (`/insights?page=`), `insights-detail` (`/insights/:slug`). Each sets Title/Meta/JSON-LD/Breadcrumb.
- [ ] Auth screens (full_auth): `/login` and `/signup` as part of the main app; `/admin/login` admin login screen.
- [ ] Consult flow: distraction-free `consult` layout (no global nav) with 2-step `ConsultationForm` (Reactive Forms, `?step=` restore, inline errors, ≥1 challenge required, email format validation, 429 message); `consult-confirmation` (`?token=`, thank-you + brief invite + `CalendarEmbed` Cal.com widget that degrades gracefully on 503).
- [ ] Brief pages: `brief/:token` (`BrandBriefForm`), `brief/:token/complete`, `brief/invalid` (404 UX).
- [ ] Admin (`admin/`, `adminGuard`): `admin` dashboard, `admin/leads` (`?status=&challenge=&sort=&page=`), `admin/leads/:id` (brief view/edit, notes, status), `admin/insights`, `admin/insights/new`, `admin/insights/:id/edit` (≥1500-word guidance).
- [ ] `/admin/settings` page — always generated; list each service in spec_deployments (postgresql, minio, llm) with configured/unconfigured badge + per-service credential form, and list each integration (Cal.com embed, MinIO, PostgreSQL, SMTP via Nodemailer) with its credential input fields.
- [ ] On `/admin/settings`, display a prominent banner: "The following need credentials to activate: Cal.com embed, SMTP via Nodemailer, PostgreSQL, MinIO." (placeholder_integrations).
- [ ] Shared UI components: `Breadcrumbs`, `TrustLogos`, `ServiceCard`, `Testimonial`, `CalendarEmbed`.
- [ ] Responsive base styles: mobile-first, ≥44px tap targets, single-column reflow, sized images/fonts for CLS<0.1, no horizontal scroll.

## service_agent tasks
- [ ] `ApiService`: typed HTTP client to `/api` for all endpoints (consultation, brief, insights, team, services, faqs, admin leads, admin insights, settings, auth).
- [ ] `AuthService`: admin + user login/signup/logout state, session cookie handling, role awareness for nav/guard.
- [ ] `admin.guard.ts` route guard using `AuthService` (redirect unauth → login on 401, block non-admin → 403).
- [ ] Cookie/credentials HTTP interceptor so all requests send the httpOnly session cookie with credentials.
- [ ] `SeoService` (Angular `Title`/`Meta` per route) and `JsonLdService` injecting `<script type="application/ld+json">` into `<head>` per route: Organization, Person, Service+OfferCatalog, FAQPage, Article, BreadcrumbList.
- [ ] Wire consult form → `POST /api/consultation`, handle `{ briefToken }` navigation to confirmation, and surface 429 rate-limit UX.
- [ ] Wire brief pages → `GET/POST /api/brief/:token` including 404 → `brief/invalid` handling.
- [ ] Wire admin leads list/detail to query-param filters/sort/pagination and PATCH updates (status, notes, brief edits).
- [ ] Wire admin insights CMS create/edit to `POST/PATCH /api/admin/insights`; wire `/admin/settings` forms to `GET/PATCH /api/admin/settings` (badges + masked values).

## tester tasks
- [ ] Backend unit (Jest): DTO validation (missing fields, bad email, no challenge category), sanitize (script/SQLi payloads neutralized), rate-limit windows, auth (hash/verify, lockout), JSON-LD builders, `resolveConfig` fallback.
- [ ] E2E (Playwright, angular_testability wait): consultation happy path + inline errors + 429.
- [ ] E2E: brief happy/abandon/invalid-404 flows.
- [ ] E2E: admin login happy/invalid/lockout; unauth `/admin`→401 redirect to login; non-admin session→403; user signup→first user ADMIN, subsequent USER.
- [ ] E2E: lead triage + filter/sort/pagination + BrandBriefAudit trail on brief edit.
- [ ] E2E: Insights publish→public visibility + sitemap lastmod update + Article JSON-LD present + robots disallows `/admin`.
- [ ] E2E: `/admin/settings` badge flip (unconfigured→configured) + placeholder banner rendering.
- [ ] SMTP-down: consultation still persists Lead + confirms + queues `EmailOutbox`; `POST /api/cron/email-retry` drains the queue.
- [ ] Lighthouse CI: LCP<2500ms, CLS<0.1, TBT proxy for INP on home/service/insights (mobile+desktop).
- [ ] Responsive: hamburger ≤768px, single-column reflow, ≥44px targets, no horizontal scroll.
- [ ] Acceptance: verify `.colossus-acceptance.json` `ready_testid`/`expect_text`/`reject_signatures` strings render on the Angular homepage with the `data-testid="app-ready"` sentinel.

## Open questions
- **Auth model conflict**: the `<auth_model>` input is `full_auth` (roles: admin, user), but the spec's `## Assumptions` explicitly resolves to `admin_only` (no public signup, all marketing routes unguarded, no `/login`/`/signup`). Per pipeline rules the `full_auth` input governs, so user signup/login/logout and `/login`+`/signup` screens are included above — but this contradicts the spec's stated intent. Confirm whether user-level auth should actually ship in Phase 1 or whether the app is truly admin-only; if admin_only, drop the user auth flows and public login/signup screens.
- **`llm` deployment**: spec_deployments includes `llm`, but the spec describes no LLM-backed feature. It is surfaced in `/admin/settings` for credential configuration only; confirm no runtime LLM integration is expected in Phase 1.
- **PostgreSQL settings alias**: spec displays `POSTGRESQL_API_KEY` as an alias while the real connection uses `DATABASE_URL`. Confirm the settings UI should show the alias read-only vs. accept an editable value.
- **Password reset**: lockout queues a reset email but no reset-completion page/endpoint ships in Phase 1 — confirm this partial flow is acceptable.
- **MinIO**: provisioned and surfaced in settings but intentionally not wired to any upload flow in Phase 1 (headshots/images are URL strings); confirm no storage feature is expected now.
