############################
# Build Stage
############################

FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci --include=dev

COPY client ./client

RUN npm run build --workspace=client

############################
# Production Stage
############################

FROM nginx:1.29-alpine

LABEL org.opencontainers.image.title="CloudSight Client"
LABEL org.opencontainers.image.description="CloudSight enterprise cloud cost intelligence frontend"
LABEL org.opencontainers.image.version="2.6.0-alpha"
LABEL org.opencontainers.image.source="https://github.com/nathanlouissaint/Cloudsight"

COPY client/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /workspace/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
