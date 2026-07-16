# Test Specification

> **Warning — `surface.json` not found.** `.pipeline/surface.json` was absent at generation
> time. The API surface below was derived from the `## Surface contract` section of
> `.pipeline/tasks.md` (authoritative task decomposition) cross-checked against `requirements`
> in the spec. If `surface.json` is later produced, reconcile this file against it.
>
> **Auth-model note.** The spec `## Assumptions` declares `admin_only`, while `tasks.md`
> builds the pipeline-mandated `full_auth` (public `/login` + `/signup`, first signup → ADMIN).
> Both surfaces are covered here; the `/api/auth/*` and `/login`/`/signup` cases apply only if
> `full_auth` ships. Tests for those routes should be skipped (not failed) if the build ships
> `admin_only`.

## Coverage summary
- Total cases: 96
- API endpoints covered: 15 / 15 (from tasks.md surface contract; surface.json missing)
- User journeys covered: 12

## API tests

### `POST /api/consultation`
- **Happy path**: valid step-1 (`fullName`, `organization`, `email`, `phone`, `serviceInterest`) + step-2 (`challengeCategories` ≥1, `situationDescription`) → `200/201`; body contains a non-empty `briefToken` (UUID/nanoid shape); a `Lead` row is persisted with `briefStatus="pending"`, `leadStatus` default, captured `ip`; an admin notification email is sent OR enqueued to `EmailOutbox`.
- **Validation failures**: missing `email` → `400`; malformed `email` (`"not-an-email"`) → `400`; empty `challengeCategories` (`[]`) → `400` (schema requires ≥1); missing `fullName` → `400`. Response lists field-level errors; no `Lead` row written.
- **Auth failures**: n/a (public endpoint).
- **Idempotency / edge cases**: 6th POST from same IP within 60 min → `429` with rate-limit message (limit 5/60min/IP); free-text fields containing `<script>`/HTML/SQL payloads are DOMPurify-sanitized before persistence (stored value has no executable markup); SMTP transport failure still returns success, persists `Lead`, and enqueues an `EmailOutbox` row with `status` pending.

### `POST /api/brief/[token]`
- **Happy path**: valid `pending` token + complete brief body (`mission`, `vision`, `differentiator`, `brandStory`, `audiences`, `brandVoice`, `successDefinition`) → `200`; `BrandBrief` persisted linked to the Lead; Lead `briefStatus="completed"`; `completedAt` set.
- **Validation failures**: valid token but missing required brief fields → `400` with field errors; no `BrandBrief` written; status stays `pending`.
- **Auth failures**: n/a (token-scoped public endpoint).
- **Idempotency / edge cases**: unknown/garbage token → `404`; already-`completed` (superseded) token → `404`; free-text brief fields sanitized before persistence; abandoning (never POSTing) leaves `briefStatus="pending"`.

### `POST /api/admin/login`
- **Happy path**: correct seeded admin `email` + `password` → `200`; httpOnly signed JWT session cookie set; `LoginAttempt` row with `success=true`.
- **Validation failures**: missing `email` or `password` → `400`.
- **Auth failures**: wrong password → `401` with generic message `"Invalid email or password"` (no user-enumeration); unknown email → `401` same generic message; `LoginAttempt` with `success=false` recorded.
- **Idempotency / edge cases**: ≥10 failed attempts for same email within 15 min → `429` account-lock response + password-reset email dispatched/enqueued; further attempts during lock window → `429`.

### `POST /api/admin/logout`
- **Happy path**: authenticated request → `200`; session cookie cleared/expired.
- **Validation failures**: n/a.
- **Auth failures**: no session cookie → still returns `200`/`204` (idempotent clear) or `401` per implementation; must not leave a valid session.
- **Idempotency / edge cases**: double logout is safe (no error).

### `PATCH /api/admin/leads/[id]`
- **Happy path**: authenticated admin updates `leadStatus` → `200`; change persisted. Add `LeadNote` → note stored with author + timestamp. Edit a brief field → `BrandBrief` updated; original value written to `BrandBriefAudit` with `adminId`, `field`, `oldValue`, `newValue`, `editedAt`.
- **Validation failures**: invalid `leadStatus` enum value → `400`; unknown lead `id` → `404`.
- **Auth failures**: unauthenticated → `401`; authenticated non-admin (USER role) → `403`.
- **Idempotency / edge cases**: editing a brief field to the same value writes no misleading audit / or writes a no-op audit consistently; concurrent edits keep audit trail append-only.

### `POST /api/admin/insights`
- **Happy path**: authenticated admin posts `title` + `body` (≥1500 words) + `status` → `201`; `InsightsPost` created with unique `slug`, `authorId`, `updatedAt` set.
- **Validation failures**: body `<1500` words → `400` word-count error; missing `title` → `400`; duplicate `slug` → `409`/`400`.
- **Auth failures**: unauthenticated → `401`; non-admin USER → `403`.
- **Idempotency / edge cases**: publishing (`status=published`) sets `publishedAt` and touches `updatedAt` so sitemap `lastmod` advances.

### `PATCH /api/admin/insights/[id]`
- **Happy path**: authenticated admin updates title/body/status → `200`; `updatedAt` refreshed.
- **Validation failures**: edited body dropping below 1500 words → `400`; unknown `id` → `404`.
- **Auth failures**: unauthenticated → `401`; non-admin USER → `403`.
- **Idempotency / edge cases**: transition draft→published sets `publishedAt` once; re-publish does not reset original `publishedAt` unexpectedly; `updatedAt` change reflected in `/sitemap.xml`.

### `GET /api/admin/settings`
- **Happy path**: authenticated admin → `200`; lists service keys (postgresql, minio) + integration env keys (Cal.com, SMTP, PostgreSQL) with **masked** values and per-key `configured` boolean.
- **Validation failures**: n/a.
- **Auth failures**: unauthenticated → `401`; non-admin USER → `403`.
- **Idempotency / edge cases**: secret values never returned in cleartext (masked); unconfigured/placeholder keys report `configured=false`.

### `PATCH /api/admin/settings`
- **Happy path**: authenticated admin upserts one or more `key`/`value` pairs → `200`; `SystemSetting` rows upserted; subsequent `GET` shows `configured=true` for those keys.
- **Validation failures**: unknown/disallowed setting key → `400`; malformed body → `400`.
- **Auth failures**: unauthenticated → `401`; non-admin USER → `403`.
- **Idempotency / edge cases**: re-submitting same key overwrites value (upsert, not duplicate); masked values are not echoed back on write.

### `POST /api/auth/signup` *(full_auth only)*
- **Happy path**: first-ever signup (`email`, `password`) → `201`; created User has `role=ADMIN`; session cookie set. Second distinct signup → User `role=USER`.
- **Validation failures**: malformed email → `400`; weak/missing password → `400`; duplicate email → `409`/`400`.
- **Auth failures**: n/a (public).
- **Idempotency / edge cases**: password stored bcrypt-hashed (never plaintext); role assignment based on existing user count is race-safe (only one ADMIN from empty DB).

### `POST /api/auth/login` *(full_auth only)*
- **Happy path**: valid credentials → `200`; session cookie set.
- **Validation failures**: missing fields → `400`.
- **Auth failures**: wrong password / unknown email → `401` generic message.
- **Idempotency / edge cases**: session cookie is httpOnly + signed.

### `POST /api/auth/logout` *(full_auth only)*
- **Happy path**: authenticated → `200`; cookie cleared.
- **Validation failures**: n/a.
- **Auth failures**: no session → idempotent `200`/`204`.
- **Idempotency / edge cases**: repeat logout safe.

### `GET /api/health`
- **Happy path**: always → `200` with liveness payload (e.g. `{ status: "ok" }`), no DB dependency.
- **Validation failures**: n/a.
- **Auth failures**: n/a (public, unguarded).
- **Idempotency / edge cases**: responds quickly even when DB is down (liveness only).

### `GET /api/health/deep`
- **Happy path**: DB reachable → `200` with DB-check payload.
- **Validation failures**: n/a.
- **Auth failures**: n/a.
- **Idempotency / edge cases**: DB unreachable → `503` with failure detail (not a `200`).

### `POST /api/cron/email-retry`
- **Happy path**: request with correct scheduler secret → `200`; drains pending `EmailOutbox` rows, increments `attempts`, marks `sent` on success.
- **Validation failures**: n/a.
- **Auth failures**: missing/incorrect secret → `401`/`403`; no outbox rows touched.
- **Idempotency / edge cases**: rows past attempt cap are skipped/parked (not retried forever); backoff respected (recently-failed rows not immediately retried); empty outbox → `200` no-op.

## UI / journey tests

### Journey: Consultation lead-capture funnel
- **Steps**: Navigate `/consult` (distraction-free layout, no global nav) → fill step 1 → Continue → URL reflects `?step=2` → fill step 2 (select ≥1 challenge category, situation text) → Submit.
- **Expected outcomes**: redirect to `/consult/confirmation`; thank-you message + Brand Brief invite link + Cal.com calendar embed rendered; `Lead` persisted with issued `briefToken`; `?step=` is addressable/restorable on reload.
- **Negative path**: submitting step with missing/invalid fields shows inline `react-hook-form` errors and does not advance; after exceeding 5 submissions/60min the form surfaces a `429` rate-limit message.

### Journey: Brand Intelligence Brief completion
- **Steps**: Open `/brief/[token]` with a valid pending token → fill all brief fields → Submit.
- **Expected outcomes**: routed to `/brief/[token]/complete` completion page; `BrandBrief` persisted; Lead `briefStatus="completed"`.
- **Negative path**: `/brief/<invalid-or-superseded-token>` renders `404` with a contact message; abandoning the form (leaving without submit) leaves `briefStatus="pending"`; empty required fields show inline errors.

### Journey: Admin authentication
- **Steps**: Visit `/admin/login` → enter seeded admin credentials → Submit.
- **Expected outcomes**: redirected to `/admin` dashboard; session cookie present.
- **Negative path**: wrong credentials show generic `"Invalid email or password"`; 10+ failures within 15 min shows lockout message and triggers password-reset email; visiting `/admin` or `/admin/leads` while unauthenticated redirects to `/admin/login` (401 semantics).

### Journey: Full-auth public signup/login/logout *(full_auth only)*
- **Steps**: Visit `/signup` → register first user → observe ADMIN access → logout → register second user at `/signup` → observe USER access → login/logout via `/login`.
- **Expected outcomes**: first user reaches admin surfaces; second (USER) user is denied admin surfaces (`403`); login/logout toggle session state and redirects.
- **Negative path**: duplicate email at `/signup` shows error; invalid login shows generic error; a logged-in USER navigating to `/admin/*` gets `403` (not the admin UI).

### Journey: Admin lead triage (CRM)
- **Steps**: As admin open `/admin/leads` → apply filters/sort via `?status=&challenge=&sort=&page=` → open a lead at `/admin/leads/[id]` → change status, add a note, edit a brief field → Save.
- **Expected outcomes**: list filters/sorts and paginates in sync with URL query params; lead detail shows all brief fields + contact + service interest; status/note/brief edits persist; brief-field edit writes original to `BrandBriefAudit` with admin identity + timestamp.
- **Negative path**: unauthenticated access to `/admin/leads` → redirect/401; USER role → 403; invalid status value rejected.

### Journey: Insights CMS publish → public + SEO
- **Steps**: As admin open `/admin/insights/new` → enter title + ≥1500-word body → set status published → Save → visit public `/insights` and `/insights/[slug]`.
- **Expected outcomes**: post appears in public `/insights` list and detail; detail page renders Article JSON-LD; `/sitemap.xml` includes the post URL with an updated `lastmod`.
- **Negative path**: saving a body `<1500` words shows word-count validation error and blocks publish; non-admin cannot reach `/admin/insights/*`.

### Journey: Admin settings credential configuration
- **Steps**: As admin open `/admin/settings` → view services (postgresql, minio) + integrations (Cal.com, SMTP, PostgreSQL) with configured/unconfigured badges and the "needs credentials" banner → enter a credential value → Save.
- **Expected outcomes**: value upserted via `PATCH /api/admin/settings`; badge flips to configured; placeholder banner updates to reflect newly-configured integration.
- **Negative path**: unauthenticated/USER access blocked (401/403); stored secrets displayed masked, never in cleartext.

### Journey: Public marketing browsing + JSON-LD
- **Steps**: Visit `/` , `/services`, `/services/[slug]`, `/about`, `/team/[slug]`, `/insights/[slug]`.
- **Expected outcomes**: `/` renders Organization JSON-LD (root layout); `/services/[slug]` renders Service + OfferCatalog + FAQPage JSON-LD and embedded FAQ; `/team/[slug]` renders Person JSON-LD; `/insights/[slug]` renders Article JSON-LD; all sub-pages render BreadcrumbList JSON-LD; each page emits `generateMetadata` title/description. `/services` shows exactly 4 service cards.
- **Negative path**: unknown `/services/[slug]`, `/team/[slug]`, `/insights/[slug]` → `not-found` (404) page.

### Journey: FAQ category filtering
- **Steps**: Visit `/faq` → apply `?category=` filter.
- **Expected outcomes**: ≥15 Q&A present across categories; filtering by `?category=` narrows the visible set to that category; FAQPage JSON-LD present.
- **Negative path**: unknown `?category=` value shows empty/all state gracefully (no crash).

### Journey: Insights pagination
- **Steps**: Visit `/insights` → navigate pages via `?page=`.
- **Expected outcomes**: list is paginated; `?page=2` shows the next set; page state reflected in URL.
- **Negative path**: out-of-range `?page=` shows empty or clamps to a valid page without error.

### Journey: SEO endpoints & robots
- **Steps**: Request `/sitemap.xml` and `/robots.txt`.
- **Expected outcomes**: `/sitemap.xml` is valid `MetadataRoute.Sitemap` output listing published posts/pages with `lastmod`; `/robots.txt` allows all, disallows `/admin`, and references the sitemap.
- **Negative path**: `/admin` paths are excluded from the sitemap.

### Journey: Responsive & Core Web Vitals
- **Steps**: Load homepage, a service page, and an insights page at mobile (≤768px) and desktop widths; exercise hamburger nav.
- **Expected outcomes**: hamburger nav appears ≤768px and toggles the mobile menu; single-column reflow; tap targets ≥44px; form fields full-width on mobile. Lighthouse CI: LCP <2500ms, CLS <0.1, INP proxy (TBT) within budget on homepage/service/insights, both mobile and desktop.
- **Negative path**: layout does not shift beyond CLS 0.1 during font/image load (`next/font` + `next/image` sizing).

## Data integrity tests
- After `POST /api/consultation`: exactly one `Lead` row with a unique, non-null `briefToken`; `briefStatus="pending"`; `ip` recorded; no unsanitized markup in any free-text column.
- After `POST /api/brief/[token]`: one `BrandBrief` linked 1:1 to its `Lead`; Lead `briefStatus` transitions `pending → completed` exactly once; `completedAt` non-null.
- After brief-field edit via `PATCH /api/admin/leads/[id]`: one `BrandBriefAudit` row per changed field capturing `oldValue`/`newValue`/`adminId`/`editedAt`; original never lost.
- After Insights publish/update: `InsightsPost.updatedAt` monotonically advances; `slug` remains unique; `publishedAt` set once on first publish.
- Login/rate-limit: `LoginAttempt` and `RateLimitHit` rows accumulate per attempt; lockout/limit computed from a sliding window (old rows outside the window do not count).
- Email: on SMTP failure an `EmailOutbox` row exists with incrementing `attempts` and `lastError`; `POST /api/cron/email-retry` transitions it to sent and never exceeds the attempt cap.
- Settings: `SystemSetting` upserts are keyed (one row per key); secrets stored but returned masked.
- All persistence goes through Prisma parameterized queries (SQL-injection payloads stored as inert data, never executed).

## Out of scope
- **Password-reset completion flow** — lockout dispatches a reset email, but no reset-token/set-new-password route or screen is specified (spec `## Open questions`). Not tested until scoped.
- **MinIO object storage / file uploads** — headshots are `headshotUrl` strings; no upload flow is described (spec `## Open questions`). Settings surfaces MinIO keys but no upload behavior is asserted.
- **Actual email deliverability / inbox receipt** — tests assert send-or-enqueue and outbox drain, not real SMTP delivery to a mailbox.
- **Cal.com live booking completion** — tests assert the embed renders with the resolved link and degrades gracefully when unconfigured (503); booking a real slot on Cal.com's side is not exercised.
- **Reconciliation of `admin_only` (spec) vs `full_auth` (tasks.md) auth models** — both surfaces are specified here; the final shipped model determines which auth cases run. Not resolved by this document.
- **Exact marketing copy / testimonial / logo content** — placeholder content correctness (final prose) is a launch-readiness manual check, not an automated assertion beyond word-count (≥1500) and FAQ-count (≥15).
```
