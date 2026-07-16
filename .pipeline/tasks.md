# Pipeline Task Decomposition

## Summary
A greenfield, SEO-optimized LeBarre Group marketing website built on Next.js 14 (App Router, SSR/SSG) + TypeScript + Tailwind + PostgreSQL/Prisma. It combines public marketing pages (home, services, about, team, FAQ, insights/blog) with a two-step consultation lead-capture funnel and a follow-up "Brand Intelligence Brief" flow, plus an authenticated admin CRM/CMS for triaging leads and managing Insights posts. SEO (JSON-LD, sitemap, robots) and Core Web Vitals are first-class requirements. Integrations: Cal.com booking embed, SMTP via Nodemailer (with DB-backed outbox retry), PostgreSQL, and MinIO object storage.

## Surface contract

### Public routes
- `/` — homepage (Organization JSON-LD in root layout).
- `/services` — 4 service cards; `/services/[slug]` — service detail + embedded FAQ + Service/OfferCatalog/FAQPage JSON-LD.
- `/about` — about page.
- `/team/[slug]` — team member bio (Person JSON-LD).
- `/faq` — ≥15 Q&A grouped by category via `?category=` (FAQPage JSON-LD).
- `/insights` — paginated post list via `?page=`; `/insights/[slug]` — post detail (Article JSON-LD).
- `/consult` — distraction-free 2-step consultation form (`?step=`); `/consult/confirmation` — thank-you + brief invite + Cal.com embed.
- `/brief/[token]` — brand brief form; `/brief/[token]/complete` — completion page.
- `/login`, `/signup` — public auth screens (full_auth model).
- `/sitemap.xml`, `/robots.txt`, `not-found` (404).

### Admin routes (protected `(admin)` group)
- `/admin/login` — admin login.
- `/admin` — dashboard.
- `/admin/leads` — paginated leads (`?status=&challenge=&sort=&page=`); `/admin/leads/[id]` — brief view, notes, status, brief-field editing.
- `/admin/insights`, `/admin/insights/new`, `/admin/insights/[id]/edit` — Insights CMS.
- `/admin/settings` — service/integration credential configuration.

### API routes
- `POST /api/consultation`, `POST /api/brief/[token]`.
- `POST /api/admin/login`, `POST /api/admin/logout`.
- `PATCH /api/admin/leads/[id]`, `POST/PATCH /api/admin/insights` + `/api/admin/insights/[id]`.
- `GET /api/admin/settings`, `PATCH /api/admin/settings`.
- `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/logout` (full_auth).
- `GET /api/health`, `GET /api/health/deep`, `POST /api/cron/email-retry`.

### Entities
Admin/User (with role), Lead, BrandBrief, BrandBriefAudit, LeadNote, TeamMember, InsightsPost, EmailOutbox, RateLimitHit, LoginAttempt, SystemSetting.

## db_agent tasks
- [ ] Create `prisma/schema.prisma` with the Postgres datasource and Prisma client generator; enable `output: 'standalone'`-friendly setup.
- [ ] Define `enum UserRole { ADMIN USER }` and a `User` model with `role UserRole @default(USER)`, `email @unique`, hashed `password`, timestamps (full_auth: first signup becomes ADMIN, later users USER).
- [ ] Define `Lead` model: `fullName`, `organization`, `email`, `phone`, `serviceInterest`, `challengeCategories String[]`, `situationDescription`, `briefToken @unique`, `briefStatus`, `leadStatus`, `ip`, `createdAt`.
- [ ] Define `BrandBrief` model: `leadId`, `mission`, `vision`, `differentiator`, `brandStory`, `audiences`, `brandVoice`, `successDefinition`, `completedAt`; relation to `Lead`.
- [ ] Define `BrandBriefAudit` model: `leadId`, `field`, `oldValue`, `newValue`, `adminId`, `editedAt`.
- [ ] Define `LeadNote` model (leadId, authorId, body, createdAt).
- [ ] Define `TeamMember` model: `slug @unique`, `fullName`, `title`, `credentials`, `honorificPrefix`, `bio`, `expertise String[]`, `affiliations`, `headshotUrl`, `linkedinUrl`, `education`, `skills String[]`.
- [ ] Define `InsightsPost` model: `slug @unique`, `title`, `body`, `authorId`, `status`, `publishedAt`, `updatedAt @updatedAt`.
- [ ] Define `EmailOutbox` model: `to`, `subject`, `body`, `status`, `attempts`, `lastError`, timestamps.
- [ ] Define `RateLimitHit` model (`key`, `action`, `createdAt`) and `LoginAttempt` model (`email`, `ip`, `success`, `createdAt`).
- [ ] Define `SystemSetting` model: `key String @id`, `value String`, `updatedAt DateTime @updatedAt` (for admin settings config of postgresql, minio, and integration credentials).
- [ ] Generate the initial migration and wire `prisma migrate deploy` into the boot sequence (Dockerfile references it).
- [ ] Create `prisma/seed.ts`: seed the first admin User (from `ADMIN_EMAIL`/`ADMIN_PASSWORD`), seed `TeamMember` rows, and reference services/FAQ content as needed.

## backend_agent tasks
- [ ] Create `src/lib/db.ts` (Prisma client singleton) and `src/lib/auth.ts` (bcryptjs hashing + `jose` JWT httpOnly signed session issue/verify).
- [ ] Create `src/middleware.ts` guarding all `/admin/*` routes except `/admin/login`: unauthenticated → redirect `/admin/login` (401), authenticated non-admin role → 403; also enforce auth on non-public app routes per full_auth.
- [ ] Implement full_auth flows: `POST /api/auth/signup` (first user → `ADMIN`, subsequent → `USER`), `POST /api/auth/login`, `POST /api/auth/logout`; issue/clear session cookie.
- [ ] Implement admin auth: `POST /api/admin/login` (bcrypt verify, generic error message, brute-force lock ≥10 fails/15min/email → 429 + password-reset dispatch) and `POST /api/admin/logout`.
- [ ] Create `src/lib/validation.ts` (zod schemas: consultation step 1/2, brand brief, login, signup, insights — email format, required fields, ≥1 challenge category), shared client+server.
- [ ] Create `src/lib/sanitize.ts` (`isomorphic-dompurify` strip of all free-text before persistence) and `src/lib/rateLimit.ts` (DB-backed sliding-window: consultation 5/60min/IP, login 10 fails/15min/email).
- [ ] Create `src/lib/email.ts` (Nodemailer SMTP send + `EmailOutbox` enqueue on failure) and `src/lib/jsonld.ts` (Organization, Person, Service+OfferCatalog, FAQPage, Article, BreadcrumbList builders).
- [ ] Implement `POST /api/consultation`: rate-limit → validate → sanitize → persist `Lead` + generate unique `briefToken` → send/enqueue admin email → return token (persist + confirm even on SMTP failure).
- [ ] Implement `POST /api/brief/[token]`: validate token → persist `BrandBrief` → set `briefStatus` `completed`; invalid/superseded token → 404.
- [ ] Implement `PATCH /api/admin/leads/[id]`: update `leadStatus`/notes/brief-field edits, writing originals to `BrandBriefAudit` with admin identity + timestamp.
- [ ] Implement Insights CMS APIs: `POST /api/admin/insights` and `PATCH /api/admin/insights/[id]` (enforce ≥1500-word body; publish touches `updatedAt` → sitemap `lastmod`), admin role required.
- [ ] Implement `GET /api/health`, `GET /api/health/deep` (DB check), and secret-guarded `POST /api/cron/email-retry` (drain `EmailOutbox` with backoff + attempt cap for Colossus scheduler).
- [ ] Create `src/lib/config.ts` with `resolveConfig(key: string): string | null` — reads `process.env[key]`, falling back to `SystemSetting` DB row when absent or equal to `PLACEHOLDER_CONFIGURE_IN_SETTINGS`, else null.
- [ ] Implement `GET /api/admin/settings` (list postgresql, minio service keys + all integration env keys with masked values + configured status) and `PATCH /api/admin/settings` (upsert key-value pairs, admin role required).
- [ ] Create `src/lib/integrations/cal-com-embed.ts` — resolve `CAL_COM_EMBED_CALCOM_EMBED_REACT_API_KEY` via `resolveConfig`, throw `ServiceUnconfiguredError` (503) when null/placeholder, export the booking-link/embed config helper the confirmation page requires.
- [ ] Create `src/lib/integrations/smtp-provider-via-nodemailer.ts` — resolve `SMTP_PROVIDER_VIA_NODEMAILER_API_KEY` (plus host/user/pass env) via `resolveConfig`, throw `ServiceUnconfiguredError` (503) when null/placeholder, export the transport/send function used by `email.ts`.
- [ ] Create `src/lib/integrations/postgresql.ts` — resolve `POSTGRESQL_API_KEY`/`DATABASE_URL` via `resolveConfig`, throw `ServiceUnconfiguredError` (503) when unconfigured, export the connection helper.
- [ ] Include every integration env key (Cal.com, SMTP, PostgreSQL) in the `GET /api/admin/settings` response alongside service credential keys.

## ui_agent tasks
- [ ] Build root `layout.tsx`: `next/font` zero-CLS fonts, `Header.tsx`/`MobileNav.tsx` (hamburger ≤768px), `Footer.tsx`, and Organization JSON-LD via `JsonLd.tsx`.
- [ ] Build homepage `page.tsx` with hero, service overview, testimonials (`Testimonial.tsx`, `TrustLogos.tsx`, `ServiceCard.tsx`).
- [ ] Build `/services` (4 cards) and `/services/[slug]` (detail + embedded FAQ + `Breadcrumbs.tsx`), consuming typed `src/content/services.ts` + `faqs.ts`.
- [ ] Build `/about` and `/team/[slug]` (bio page from `TeamMember` data).
- [ ] Build `/faq` with category filtering via `?category=` (≥15 Q&A) and `/insights` (paginated `?page=`) + `/insights/[slug]` detail.
- [ ] Build `/consult` distraction-free layout (no global nav) with `ConsultationForm.tsx` (2-step, `react-hook-form`+zod, `?step=` restore, inline errors, 429 handling) and `/consult/confirmation` (thank-you + brief invite + `CalendarEmbed.tsx` Cal.com embed).
- [ ] Build `/brief/[token]` with `BrandBriefForm.tsx` and `/brief/[token]/complete` completion page.
- [ ] Build full_auth public `/login` and `/signup` screens as part of the main app.
- [ ] Build admin login screen at `/admin/login` and the `(admin)` route group layout enforcing admin role check (admin nav visible only to admins).
- [ ] Build `/admin` dashboard, `/admin/leads` (paginated list with filter/sort by status & challenge via query params), and `/admin/leads/[id]` (brief fields + contact + service interest, editable status, notes, brief-field editing).
- [ ] Build `/admin/insights`, `/admin/insights/new`, `/admin/insights/[id]/edit` Insights CMS screens (title/body/status, ≥1500-word guidance).
- [ ] Build `/admin/settings` page: list each service in `postgresql, minio` and each integration (Cal.com, SMTP, PostgreSQL) with configured/unconfigured badges and per-service/per-integration credential input fields; display prominent banner "The following need credentials to activate: Cal.com embed, SMTP provider via Nodemailer, PostgreSQL" (placeholder integrations).
- [ ] Build `sitemap.ts` (dynamic from published posts/pages with `lastmod`), `robots.ts` (allow all, disallow `/admin`, reference sitemap), and `not-found.tsx`; add per-page `generateMetadata` + JSON-LD blocks (`JsonLd.tsx`) for each page type.
- [ ] Apply responsive/performance pass: Tailwind mobile-first, hamburger nav ≤768px, single-column reflow, ≥44px tap targets, full-width fields, `next/image` sizing to hold CLS <0.1, minimal client JS for INP <200ms.

## service_agent tasks
- [ ] Create the client-side data/API layer that wires `ConsultationForm.tsx` to `POST /api/consultation` (submit, receive token, redirect to confirmation, surface 429 rate-limit messages).
- [ ] Wire `BrandBriefForm.tsx` to `POST /api/brief/[token]` (submit, handle invalid/superseded token → 404 UX, route to complete page).
- [ ] Wire public auth screens (`/login`, `/signup`) and admin login to `/api/auth/*` and `/api/admin/login|logout`, handling session redirects and error states.
- [ ] Wire admin leads screens to `PATCH /api/admin/leads/[id]` and list/filter/sort queries; keep pagination + query-param state in sync with the URL.
- [ ] Wire admin Insights screens to the Insights create/update APIs, handling publish flow and validation feedback.
- [ ] Wire `/admin/settings` forms to `GET`/`PATCH /api/admin/settings` (load masked values + configured status, submit credential upserts, refresh badges).
- [ ] Wire the Cal.com `CalendarEmbed.tsx` on the confirmation page to the resolved booking link, degrading gracefully when the integration is unconfigured (503/`ServiceUnconfiguredError`).

## tester tasks
- [ ] Vitest unit: zod validators (missing fields, bad email, no challenge category), `sanitize.ts` (script/SQLi payloads neutralized), rate-limit windows, JWT/auth helpers, and `jsonld.ts` builders (valid schema.org shapes).
- [ ] Playwright E2E — consultation happy path: submit → Lead persisted + token issued → confirmation page with brief invite + calendar embed.
- [ ] Playwright E2E — consultation edge cases: inline validation errors and 429 rate-limit (5/60min) message.
- [ ] Playwright E2E — brand brief: happy path (status `completed`), abandonment (status `pending`), invalid token → 404 with contact message.
- [ ] Playwright E2E — auth: admin login happy/invalid/lockout, full_auth signup (first user ADMIN, subsequent USER) + login/logout, unauthenticated `/admin` → 401/redirect, non-admin USER → 403.
- [ ] Playwright E2E — admin CRM: lead triage, filter/sort by status & challenge, brief-field edit writes `BrandBriefAudit`.
- [ ] Playwright E2E — Insights publish → post appears public and `/sitemap.xml` `lastmod` updates; assert JSON-LD blocks present per page type and verify `/robots.txt` disallows `/admin`.
- [ ] Playwright E2E — admin settings: configure a service/integration credential, badge flips to configured, placeholder banner reflects state.
- [ ] Lighthouse CI (@lhci/cli): enforce LCP <2500ms, CLS <0.1, INP proxy (TBT) on homepage/service/insights, mobile + desktop.
- [ ] Manual/documented check: SMTP-down consultation submission still persists Lead + confirms + queues `EmailOutbox` retry drained by `/api/cron/email-retry`.

## Open questions
- Spec's `## Assumptions` declares `auth_model = admin_only` (public marketing site, no public signup), but the pipeline `<auth_model>` input is `full_auth` (roles admin, user). Per pipeline rules the `full_auth` input governs (public `/login`+`/signup`, first-signup-becomes-admin), which conflicts with the spec's "admin seeded from env, no public signup" intent — confirm which should ship and how the env-seeded admin reconciles with signup-based admin promotion.
- `minio` is a provisioned deployment but the spec body references no object storage usage (headshots are `headshotUrl` strings, no upload flow described). Confirm whether MinIO backs team headshot / Insights image uploads or is unused (still surfaced in `/admin/settings`).
- Integration env-key naming: `POSTGRESQL_API_KEY` is provided as an integration key, but Postgres connectivity uses `DATABASE_URL`. Confirm the canonical key(s) to display/resolve in settings.
- Password-reset dispatch on admin login lockout is referenced but no reset-completion route/screen is specified — confirm whether a reset flow (token + set-new-password page) is in scope or out of scope for this build.
