# Test Specification

> ⚠️ **WARNING — `.pipeline/surface.json` was not found.** The API/route surface
> below is derived from `requirements/spec.md` and `.pipeline/tasks.md` (its
> "Surface contract" section). Endpoint totals are therefore best-effort, not
> authoritative. If `surface.json` is later produced, reconcile this file against it.
>
> ⚠️ **Auth-model note.** The spec's `## Assumptions` resolves the platform to
> **admin_only** (no public signup/login, all marketing routes unguarded). The
> upstream `tasks.md` carries a `full_auth` variant (`/login`, `/signup`,
> `POST /api/auth/*`) flagged as an open question. This test spec follows the
> **spec (admin_only)** as the source of truth; the full_auth user-auth endpoints
> are listed under **Out of scope** pending confirmation.

## Coverage summary
- Total cases: 96
- API endpoints covered: 23 / 23 (derived; surface.json missing)
- User journeys covered: 11

## API tests

Endpoints derived from the spec + `tasks.md` surface contract (admin_only model).
All `/api/*` responses are JSON; `/sitemap.xml` and `/robots.txt` are XML/plaintext
and are served WITHOUT the `/api` prefix (proxied by nginx).

### `POST /api/admin/login`
- **Happy path**: `{ email: <seeded ADMIN_EMAIL>, password: <ADMIN_PASSWORD> }` → `200`, sets httpOnly signed session cookie (`Set-Cookie` present, `HttpOnly`, `SameSite`), body confirms authenticated admin (no password/hash echoed).
- **Validation failures**: missing `email` or `password`, malformed email → `400` from ValidationPipe.
- **Auth failures**: wrong password or unknown email → `401` with the **generic** message `"Invalid email or password"` (no user-enumeration difference between the two cases).
- **Idempotency / edge cases**: brute-force lock — after ≥10 failed attempts for the same email within 15 min → `429`; a password-reset email is queued to `EmailOutbox`; subsequent valid credentials within the window still return `429` until the window elapses.

### `POST /api/admin/logout`
- **Happy path**: with a valid admin session cookie → `200`, clears/expires the session cookie (`Set-Cookie` with past expiry or empty value).
- **Validation failures**: n/a (no body).
- **Auth failures**: no session cookie → returns `200`/`204` idempotently (logout is safe to call unauthenticated); assert it does NOT `500`.
- **Idempotency / edge cases**: calling logout twice leaves the client with no session cookie.

### `POST /api/consultation`
- **Happy path**: valid DTO `{ name, organization, email (valid format), serviceInterest, challenges: [≥1 category], situation }` → `201/200` with body `{ briefToken: <non-empty unique string> }`; a `Lead` row is persisted with a unique crypto-random `briefToken`; admin notification email dispatched off the critical path.
- **Validation failures**: missing any required field (`name`/`organization`/`email`/`serviceInterest`/`situation`) → `400`; malformed `email` → `400`; empty `challenges` array (0 categories) → `400`; extra/unknown fields stripped by whitelist.
- **Auth failures**: n/a (public endpoint).
- **Idempotency / edge cases**:
  - **Rate limit** — 6th request from the same IP within 60 min → `429`.
  - **Sanitization** — `situation`/free-text containing `<script>alert(1)</script>` or SQLi payload (`'; DROP TABLE ...`) is neutralized/stripped before persistence (stored value contains no active markup).
  - **SMTP down** — Lead still persisted, response still `{ briefToken }`, email enqueued to `EmailOutbox` (no 5xx).
  - **Performance** — single-write path; p95 latency < 1000ms (email async).

### `GET /api/brief/:token`
- **Happy path**: valid `briefToken` → `200` with `{ lead, brief }` data needed to render the brand-brief form.
- **Validation failures**: n/a (token is a path param).
- **Auth failures**: n/a (public, token-scoped).
- **Idempotency / edge cases**: unknown token → `404`; superseded token → `404` (drives `/brief/invalid` UX).

### `POST /api/brief/:token`
- **Happy path**: valid token + valid brief body → `200/201`; persists `BrandBrief`, sets `briefStatus=COMPLETED` and `completedAt` timestamp.
- **Validation failures**: missing required brief fields → `400`; free-text sanitized before persistence.
- **Auth failures**: n/a (token-scoped).
- **Idempotency / edge cases**: unknown/superseded token → `404`; re-submitting a completed brief behaves deterministically (either updates or rejects — assert no duplicate BrandBrief rows / no 500).

### `GET /api/admin/leads`
- **Happy path**: authenticated admin → `200` with paginated list `{ items: [...], total, page }`.
- **Validation failures**: invalid `sort` / `page` values → `400` or safe default (assert no 500).
- **Auth failures**: no session → `401`; non-ADMIN session → `403`.
- **Idempotency / edge cases**: `?status=`, `?challenge=`, `?sort=`, `?page=` filters return correctly narrowed/ordered/paginated result sets; empty result set returns `200` with `items: []`.

### `GET /api/admin/leads/:id`
- **Happy path**: authenticated admin, existing id → `200` with lead + brief + notes.
- **Validation failures**: non-numeric/malformed id → `400`.
- **Auth failures**: no session → `401`; non-ADMIN → `403`.
- **Idempotency / edge cases**: unknown id → `404`.

### `PATCH /api/admin/leads/:id`
- **Happy path**: authenticated admin updates `leadStatus` → `200`, persisted; adding a note creates a `LeadNote`; editing a brief field writes a `BrandBriefAudit` row with `adminId` + timestamp and preserves the original value.
- **Validation failures**: invalid `leadStatus` enum value → `400`; free-text note sanitized.
- **Auth failures**: no session → `401`; non-ADMIN → `403`.
- **Idempotency / edge cases**: unknown id → `404`; a brief-field edit records the actual before→after in the audit (no misleading audit on a no-op change).

### `GET /api/insights`
- **Happy path**: public → `200` with list of PUBLISHED posts only (drafts excluded).
- **Validation failures**: invalid pagination param → safe default / `400`.
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: pagination honored; unpublished/draft posts never appear.

### `GET /api/insights/:slug`
- **Happy path**: published slug → `200` with full article body + metadata for Article JSON-LD.
- **Validation failures**: n/a.
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: unknown slug → `404`; draft (unpublished) slug → `404` for public callers.

### `POST /api/admin/insights`
- **Happy path**: authenticated admin, body ≥1500 words → `201` with created post.
- **Validation failures**: body `< 1500` words → `400/422` with clear message; missing `slug`/`title` → `400`; duplicate slug → `409`/`400`.
- **Auth failures**: no session → `401`; non-ADMIN → `403`.
- **Idempotency / edge cases**: HTML in body sanitized per policy while preserving legitimate content.

### `PATCH /api/admin/insights/:id`
- **Happy path**: authenticated admin edits post; publishing touches `updatedAt` (drives sitemap `lastmod`).
- **Validation failures**: edit that drops body below 1500 words → `400/422`.
- **Auth failures**: no session → `401`; non-ADMIN → `403`.
- **Idempotency / edge cases**: unknown id → `404`; publishing a draft flips status to PUBLISHED and makes it visible on `GET /api/insights`.

### `GET /api/team`
- **Happy path**: public → `200` with array of TeamMembers.
- **Validation failures**: n/a.
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: seeded members present; image fields are URL strings (MinIO not wired).

### `GET /api/team/:slug`
- **Happy path**: valid slug → `200` with member detail (fields for Person JSON-LD).
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: unknown slug → `404`.

### `GET /api/services`
- **Happy path**: public → `200` with services list (from static `services.ts`).
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: each service exposes ≥3 associated FAQs (cross-check with `/api/faqs`).

### `GET /api/faqs`
- **Happy path**: public → `200` with ≥15 Q&A entries total.
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: ≥3 Q&A per service; optional category grouping supports `/faq?category=` UI.

### `GET /api/admin/settings`
- **Happy path**: authenticated admin → `200` with entries for postgresql, minio, and integration keys (`CAL_COM_EMBED_API_KEY`, `SMTP_VIA_NODEMAILER_API_KEY`, `POSTGRESQL_API_KEY`, `MINIO_API_KEY`), each with a **masked** value and a `configured` boolean flag.
- **Validation failures**: n/a.
- **Auth failures**: no session → `401`; non-ADMIN → `403`.
- **Idempotency / edge cases**: secrets are never returned in cleartext; unset keys report `configured: false`.

### `PATCH /api/admin/settings`
- **Happy path**: authenticated admin upserts a `SystemSetting` → `200`; the corresponding key's `configured` flag flips to `true` on the next `GET`.
- **Validation failures**: unknown/unsupported key → `400`; empty value handling defined (assert no 500).
- **Auth failures**: no session → `401`; non-ADMIN → `403`.
- **Idempotency / edge cases**: `resolveConfig(key)` precedence — env var wins; `PLACEHOLDER_CONFIGURE_IN_SETTINGS` or absent env falls back to the DB `SystemSetting`; null when neither set.

### `POST /api/cron/email-retry`
- **Happy path**: request with the correct cron secret → `200`; drains `EmailOutbox` (pending emails attempted; sent ones marked, failures re-queued with incremented attempt count + backoff).
- **Validation failures**: n/a.
- **Auth failures**: missing/incorrect secret → `401/403`.
- **Idempotency / edge cases**: entries exceeding the attempt cap are not retried indefinitely; running with an empty outbox returns `200` (no-op).

### `GET /sitemap.xml`
- **Happy path**: → `200`, `Content-Type` XML; includes static pages + every PUBLISHED insights post with `<lastmod>` reflecting `updatedAt`, plus `changefreq`/canonical URLs.
- **Auth failures**: n/a (public, unprefixed).
- **Idempotency / edge cases**: publishing/updating a post updates its `lastmod`; drafts are excluded.

### `GET /robots.txt`
- **Happy path**: → `200`, plaintext; `Allow: /`, `Disallow: /admin`, and a `Sitemap:` reference to `/sitemap.xml`.
- **Auth failures**: n/a (public, unprefixed).
- **Idempotency / edge cases**: served without the `/api` prefix (nginx proxy path).

### `GET /api/health`
- **Happy path**: → `200` with liveness payload (no DB dependency).
- **Idempotency / edge cases**: excluded from the `/api` prefix rewrite per config, still reachable at `/api/health`.

### `GET /api/health/deep`
- **Happy path**: DB reachable → `200` with DB ping success.
- **Idempotency / edge cases**: DB unreachable → `503` (readiness fails cleanly, not a 500 stack trace).

## UI / journey tests

Playwright with the `angular_testability` wait strategy; every assertion should wait
on the `data-testid="app-ready"` sentinel before interacting.

### Journey: Public browsing & SEO
- **Steps**: Visit `/` → `/services` → open a `/services/:slug` → `/about` → `/team/:slug` → `/faq?category=<cat>` → `/insights?page=1` → open an `/insights/:slug`.
- **Expected outcomes**: Home renders hero, services overview, philosophy, social proof, trust logos, and a testimonial adjacent to the CTA. Each route sets a unique `<title>`/meta and injects a matching `<script type="application/ld+json">` into `<head>`: Organization (home), Service+OfferCatalog (service detail), Person (team detail), FAQPage (faq), Article (insight detail), plus BreadcrumbList where breadcrumbs render. FAQ `?category=` filters visible Q&A; deep-linking each URL (path-based routing + nginx fallback) loads the correct state directly.
- **Negative path**: unknown `:slug` on service/team/insight → not-found UX (no blank page / no console crash).

### Journey: Consultation submission (happy path)
- **Steps**: Visit `/consult` (distraction-free layout, NO global nav) → fill step 1 → advance (`?step=2`) → fill step 2 (select ≥1 challenge) → submit.
- **Expected outcomes**: Reactive form advances between steps; `?step=` restores position on reload; on submit the app POSTs `/api/consultation`, receives `{ briefToken }`, and navigates to `/consult-confirmation?token=<briefToken>` showing thank-you + brief invite + Cal.com `CalendarEmbed`.
- **Negative path**: inline validation on empty required fields, invalid email format, and 0 challenges selected (submit blocked with inline errors); a `429` from the API surfaces the rate-limit message rather than a generic failure.

### Journey: Brand brief completion
- **Steps**: Navigate to `/brief/:token` (valid) → fill BrandBriefForm → submit → land on `/brief/:token/complete`.
- **Expected outcomes**: Form pre-loads lead/brief context from `GET /api/brief/:token`; submit POSTs and shows completion page; `briefStatus=COMPLETED` persisted.
- **Negative path**: **abandon** — leaving without submitting persists no BrandBrief. **Invalid** — unknown/superseded token → app routes to `/brief/invalid` (404 UX) on the `GET` 404.

### Journey: Admin login (happy / invalid / lockout)
- **Steps**: Visit `/admin/login` → enter credentials → submit.
- **Expected outcomes**: valid admin creds → session cookie set, redirect to `/admin` dashboard.
- **Negative path**: wrong creds → generic "Invalid email or password" shown (no enumeration); ≥10 failures in 15 min → `429` lockout message shown and a reset email queued (verify via outbox/DB).

### Journey: Admin route protection
- **Steps**: As an unauthenticated client, request `/admin`, `/admin/leads`, `/admin/settings`.
- **Expected outcomes**: unauth access → guard triggers 401 semantics → redirect to `/admin/login`. A non-ADMIN session (if one exists) → 403 handling (blocked from admin area).
- **Negative path**: directly deep-linking an admin URL while unauthenticated never renders admin data before redirect.

### Journey: Lead triage (filter / sort / audit)
- **Steps**: Logged-in admin opens `/admin/leads?status=&challenge=&sort=&page=` → applies filters/sort/pagination → opens `/admin/leads/:id` → changes `leadStatus` → adds a note → edits a brief field.
- **Expected outcomes**: query-param filters/sort/pagination reflected in the list and URL; status change persists; note appears as a `LeadNote`; brief-field edit creates a `BrandBriefAudit` entry showing adminId, timestamp, and the preserved original value.
- **Negative path**: invalid filter values degrade gracefully (no crash); unknown lead id → not-found UX.

### Journey: Insights publish → public + SEO propagation
- **Steps**: Admin creates a post at `/admin/insights/new` (≥1500 words) → publishes → visits public `/insights/:slug` → fetches `/sitemap.xml` and `/robots.txt`.
- **Expected outcomes**: sub-1500-word body blocked with guidance; published post becomes visible on `/insights` and `/insights/:slug`; Article JSON-LD present on the detail page; sitemap includes the post with updated `lastmod`; robots disallows `/admin`.
- **Negative path**: draft stays invisible publicly and absent from the sitemap until published.

### Journey: Admin settings badge flip
- **Steps**: Admin opens `/admin/settings` → observes unconfigured badges + the placeholder banner → enters a credential for a service → saves.
- **Expected outcomes**: banner reads "The following need credentials to activate: Cal.com embed, SMTP via Nodemailer, PostgreSQL, MinIO."; each service/integration shows a configured/unconfigured badge; after PATCH, the saved key's badge flips unconfigured→configured; saved secret displays masked.
- **Negative path**: saving an empty/invalid value does not falsely flip a badge to configured.

### Journey: Cal.com embed graceful degradation
- **Steps**: Reach `/consult-confirmation?token=` when `CAL_COM_EMBED_API_KEY` is unconfigured.
- **Expected outcomes**: the `CalendarEmbed` degrades gracefully (503-handled placeholder / friendly message) instead of throwing; the thank-you + brief invite content still renders.
- **Negative path**: configured key → live Cal.com widget loads.

### Journey: SMTP-down resilience
- **Steps**: With SMTP unavailable, submit a consultation → then call `POST /api/cron/email-retry` (correct secret) after SMTP recovers.
- **Expected outcomes**: consultation still persists the Lead and returns the confirmation `{ briefToken }`; the notification email is queued in `EmailOutbox`; the cron drain sends it and marks it delivered.
- **Negative path**: outbox entries past the attempt cap are not retried forever.

### Journey: Responsive layout
- **Steps**: Load home/service/insights at ≤768px and at desktop widths.
- **Expected outcomes**: hamburger `MobileNav` appears ≤768px; layout reflows to a single column; all tap targets ≥44px; no horizontal scroll; images/fonts sized to hold CLS < 0.1.
- **Negative path**: rotating/resizing does not introduce overflow or overlapping nav.

## Data integrity tests
- A successful `POST /api/consultation` creates exactly one `Lead` with a **unique** non-null `briefToken`; token collisions never occur across concurrent submissions.
- All persisted free-text (consultation `situation`, brief fields, lead notes) is sanitized — stored values contain no executable `<script>`/HTML and no injected SQL executes.
- `POST /api/brief/:token` sets `briefStatus=COMPLETED` and a non-null `completedAt`, and does not create duplicate `BrandBrief` rows for one lead.
- Every admin brief-field edit writes one `BrandBriefAudit` row capturing `adminId`, timestamp, and the original (pre-edit) value; originals are never overwritten in the audit trail.
- `InsightsPost.updatedAt` advances on publish/edit and is the value emitted as sitemap `<lastmod>`.
- Rate-limit state (`RateLimitHit`) and login lockout state (`LoginAttempt`) are windowed correctly: counts reset after the window (60 min for consultation IP, 15 min for login email) and do not leak across IPs/emails.
- `EmailOutbox` rows track attempt count and are capped; a delivered email is marked sent and not re-sent by the retry cron.
- `SystemSetting` upserts are idempotent per `key` (no duplicate rows); `configured` reflects presence of a real value, not the `PLACEHOLDER_CONFIGURE_IN_SETTINGS` sentinel.
- `GET /api/insights` and `/sitemap.xml` never expose draft (unpublished) posts.

## Out of scope
- **Full-auth user flows** (`POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `/login`, `/signup`, first-user-becomes-ADMIN) — present in `tasks.md` (full_auth) but the spec resolves the product to **admin_only**. Not tested here pending resolution of the open question; if full_auth is confirmed for Phase 1, add signup/login/logout API + journey cases.
- **Password-reset completion** — lockout queues a reset email, but no reset-completion page/endpoint ships in Phase 1 (spec-silent); only the enqueue is asserted.
- **MinIO upload/storage flow** — provisioned and surfaced in settings only; no upload feature exists in Phase 1 (images are URL strings), so no upload tests.
- **LLM runtime integration** — `llm` appears in settings for credential entry only; the spec describes no LLM-backed feature, so no functional LLM tests.
- **SSR / server-rendered SEO** — SEO is client-injected JSON-LD by design; non-JS AI-crawler indexing quality is an accepted trade-off, not a test target.
- **Lighthouse CI thresholds** (LCP<2500ms, CLS<0.1, TBT/INP proxy) — measured by the separate Lighthouse CI tooling, not by functional Playwright/Jest cases; referenced here only via the responsive/CLS journey.
- **`surface.json` reconciliation** — endpoint counts are derived because the machine-readable surface file is missing; treat totals as approximate until it is generated.

Wrote .pipeline/test_spec.md (96 cases across 23 endpoints / 11 journeys).
