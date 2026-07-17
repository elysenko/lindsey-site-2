FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3000
# Boot: apply pending migrations (fatal — K8s must not route to a bad schema),
# seed idempotently (non-fatal — emits SEED_CRED and ensures the admin user),
# then start the API. The deploy harness may also run migrate/seed as separate
# steps; both are idempotent so running here as well is safe.
CMD ["sh", "-c", "npx prisma migrate deploy && (node prisma/seed/seed.js || echo '[boot] seed skipped (non-fatal)') && node dist/main"]
