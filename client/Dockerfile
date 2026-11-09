FROM node:20-alpine AS build

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci --include=dev

COPY client ./client

ARG VITE_API_URL=/api
ARG VITE_WEBSITE_AUDIT_BOOKING_URL=
ARG VITE_POSTHOG_KEY=
ARG VITE_POSTHOG_HOST=

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WEBSITE_AUDIT_BOOKING_URL=${VITE_WEBSITE_AUDIT_BOOKING_URL}
ENV VITE_POSTHOG_KEY=${VITE_POSTHOG_KEY}
ENV VITE_POSTHOG_HOST=${VITE_POSTHOG_HOST}

RUN npm run build --workspace=client

FROM nginx:1.29-alpine AS runner

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --spider -q http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
