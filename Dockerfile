# syntax=docker/dockerfile:1
# Combined nginx + supervisord + NestJS backend + Angular frontend container.
# HAS_BACKEND=true → the deploy pipeline requires a single image serving both
# frontend static assets (nginx :80) and backend API (node :3000) supervised
# by supervisord as PID 1.

# ── Stage 1: backend builder ────────────────────────────────────────────────
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app/backend

# Install openssl (required by Prisma for engine startup) plus python/make/g++
# for any native deps that npm might need to compile.
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund

COPY backend/ ./

# Generate Prisma client + build NestJS. Prisma's env() helper needs a value even
# though we never connect at build time; the placeholder is not baked into runtime.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build \
  && test -n "$(find /app/backend/dist -name main.js | head -1)" \
     || (echo 'ERROR: no main.js in dist — check tsconfig rootDir' && exit 1)

# Prune to production deps so the runtime image is lean but keeps @prisma/client.
RUN --mount=type=cache,target=/root/.npm \
    npm prune --omit=dev --legacy-peer-deps

# ── Stage 2: frontend builder ───────────────────────────────────────────────
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/web

COPY web/package.json web/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --no-audit --no-fund

COPY web/ ./

# BASE_HREF=/ — served at subdomain root per single-public-preview model.
RUN npx ng build --configuration production --base-href /

# ── Stage 3: runtime — nginx + supervisord + node ───────────────────────────
FROM node:20-bookworm-slim AS runtime

# Install nginx, supervisord, and Prisma runtime deps.
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx supervisor openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/log/nginx /var/lib/nginx /run/nginx

# Backend runtime — copy pruned node_modules + built dist + prisma schema + package.json
WORKDIR /app/backend
COPY --from=backend-builder /app/backend/package.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma

# Frontend static assets — Angular 17+ outputs to dist/<project>/browser/
COPY --from=frontend-builder /app/web/dist/frontend/browser /usr/share/nginx/html

# nginx config (single-server, proxies /api and /trpc to 127.0.0.1:3000)
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# supervisord config
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

# supervisord PID 1 supervises both nginx and node backend
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
