FROM node:20-alpine AS deps

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY server/prisma ./server/prisma

RUN npm ci --include=dev
RUN npx prisma generate --schema=server/prisma/schema.prisma


FROM node:20-alpine AS builder

WORKDIR /workspace

COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/server/node_modules ./server/node_modules
COPY package.json package-lock.json ./
COPY server ./server

RUN npm run build --workspace=server


FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="CloudSight Server"
LABEL org.opencontainers.image.description="CloudSight enterprise cloud cost intelligence API"
LABEL org.opencontainers.image.version="2.6.0-alpha"
LABEL org.opencontainers.image.source="https://github.com/nathanlouissaint/Cloudsight"

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S cloudsight \
    && adduser -S cloudsight -G cloudsight

COPY --from=builder /workspace/server/package.json ./package.json
COPY --from=builder /workspace/server/prisma ./prisma
COPY --from=builder /workspace/server/dist ./dist
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/server/node_modules ./node_modules

RUN npm prune --omit=dev \
    && chown -R cloudsight:cloudsight /app

USER cloudsight

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:5001/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
