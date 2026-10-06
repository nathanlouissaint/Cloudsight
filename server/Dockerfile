FROM node:20-alpine AS dependencies

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
COPY server/prisma ./server/prisma

RUN npm ci --include=dev
RUN npx prisma generate --schema=server/prisma/schema.prisma

FROM dependencies AS build

COPY server ./server

RUN npm run build --workspace=server

FROM build AS migrator

WORKDIR /workspace/server

CMD ["npx", "prisma", "migrate", "deploy", "--schema=prisma/schema.prisma"]

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S cloudsight \
    && adduser -S cloudsight -G cloudsight

COPY --from=build /workspace/server/package.json ./package.json
COPY --from=build /workspace/server/dist ./dist
COPY --from=build /workspace/server/prisma ./prisma
COPY --from=dependencies /workspace/node_modules ./node_modules

RUN npm prune --omit=dev \
    && chown -R cloudsight:cloudsight /app

USER cloudsight

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:5001/health || exit 1

CMD ["node", "dist/index.js"]
