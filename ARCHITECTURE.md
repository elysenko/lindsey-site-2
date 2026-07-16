# Architecture

## Requested stack
- `web` (only platform requested)

## Scaffolding outcome: NOT scaffolded — template/plan mismatch

This project's plan calls for **Next.js 14 (App Router, SSR/SSG) + TypeScript +
PostgreSQL/Prisma** as a standalone marketing site with SSR/SEO requirements
(dynamic `sitemap.ts`/`robots.ts`, per-page `generateMetadata`, JSON-LD,
`next/image`/`next/font` for Core Web Vitals, Next.js API route handlers,
`output: 'standalone'` Docker build).

The scaffolder's `template-web/` directory (`/app/scaffold-templates/template-web/`)
does **not** contain a Next.js template. On inspection it is an **Angular 17 +
NestJS** scaffold (`frontend/` = Angular app with `angular.json`, JWT
login/auth module, `core`/`features` folders; `backend/` = NestJS with
Passport-JWT auth, a `user` module, Prisma). This is a different stack from
the enterprise template's tRPC-based Angular/NestJS pairing, but it is
**not Next.js** in either case.

Copying this template into `{project_dir}/web/` would have:
- Contradicted the plan's explicit SSR/SEO/Next.js requirements (Angular is a
  client-rendered SPA; it cannot produce `sitemap.ts`, per-request
  `generateMetadata`, or SSR'd JSON-LD the way the plan requires).
- Produced a `colossus.yaml` that this scaffolder would otherwise generate as
  `framework: nextjs` / `outputDir: .next` / `port: 3000`, which does not
  match Angular+Nest build/serve semantics (`ng build` → static `dist/`,
  served by nginx on port 80, separate Nest API on port 3000) — a guaranteed
  deploy break.

To avoid shipping a broken or misleading scaffold, **no files were copied**.
The project directory was left as-is (`README.md` + `.github/workflows/colossus-deploy.yml`
only). `colossus.yaml` and `.colossus-acceptance.json` were **not** written,
since no web frontend was actually scaffolded.

## Next steps for the build/coder agent
1. Hand-scaffold a Next.js 14 App Router project per the plan's Step 1
   (`package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`,
   `Dockerfile` with `output: 'standalone'`, `prisma/schema.prisma`) — there is
   no matching template to copy from, so this must be built directly from the
   plan.
2. Once the frontend exists, generate `colossus.yaml` (framework: nextjs,
   outputDir: `.next`, port 3000, `baseHref: "/{{IMAGE_NAME}}/"`) and
   `.colossus-acceptance.json` (`ready_testid`, `expect_text`, `reject_signatures`)
   so the deploy/render-gate agents have their contract.
3. Alternatively, if an Angular+NestJS stack is acceptable instead of Next.js,
   use the `enterprise` stack (flat Angular+NestJS+tRPC+Prisma template),
   which is a maintained, matching template — but this changes the plan's
   SSR/SEO approach and should be confirmed with the requester first.

## Template sources evaluated
- `template-web/` at `/app/scaffold-templates/template-web/` — present but
  mismatched (Angular+NestJS, not Next.js). Not copied.
