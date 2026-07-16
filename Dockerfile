# ── deps ─────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci

# ── builder ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy URL satisfies `prisma generate`/`next build` — no real DB needed at build.
ENV DATABASE_URL="postgresql://x:x@localhost:5432/x"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone server + static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma: schema + migrations + CLI + engines so `migrate deploy` runs at boot.
# `.prisma`/`@prisma/client` + bcryptjs are also what `prisma/seed.js` needs — the
# standalone trace bundles bcryptjs into the app chunks but NOT into node_modules,
# so it must be copied explicitly for the seed to resolve it.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

EXPOSE 3000
# Run pending migrations (fatal on failure — K8s won't route to a bad schema),
# then seed idempotently (non-fatal: seed emits SEED_CRED and ensures the admin
# user exists, but a transient seed error must not block serving), then start the
# standalone server.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && (node prisma/seed.js || echo '[boot] seed skipped (non-fatal)') && node server.js"]
