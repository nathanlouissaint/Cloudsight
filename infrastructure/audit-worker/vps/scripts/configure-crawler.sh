#!/usr/bin/env bash
set -euo pipefail

: "${CRAWLER_HOST:?Set CRAWLER_HOST to the crawler public IP or hostname}"
: "${CRAWLER_IMAGE:?Set CRAWLER_IMAGE to an immutable image reference}"
: "${AUDIT_WORKER_BROKER_URL:?Set AUDIT_WORKER_BROKER_URL}"
: "${AUDIT_WORKER_BROKER_TOKEN:?Set AUDIT_WORKER_BROKER_TOKEN}"

ssh "root@${CRAWLER_HOST}" "install -d -m 0700 /etc/cloudsight"
ssh "root@${CRAWLER_HOST}" "cat > /etc/cloudsight/audit-worker.env && chmod 600 /etc/cloudsight/audit-worker.env" <<EOF
NODE_ENV=production
AUDIT_WORKER_BROKER_URL=${AUDIT_WORKER_BROKER_URL}
AUDIT_WORKER_BROKER_TOKEN=${AUDIT_WORKER_BROKER_TOKEN}
AUDIT_CRAWLER_NETWORK_ISOLATION=
AUDIT_CRAWLER_EGRESS_PROXY_URL=http://$(ssh "root@${CRAWLER_HOST}" "awk '/nameserver/{print \$2; exit}' /etc/resolv.conf"):3128
WEBSITE_AUDIT_GLOBAL_CONCURRENCY=2
WEBSITE_AUDIT_DOMAIN_CONCURRENCY=1
WEBSITE_AUDIT_ROBOTS_CACHE_TTL_MS=300000
EOF
ssh "root@${CRAWLER_HOST}" "docker pull '${CRAWLER_IMAGE}' && docker rm -f cloudsight-audit-worker >/dev/null 2>&1 || true; docker run -d --name cloudsight-audit-worker --restart unless-stopped --network host --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges:true --env-file /etc/cloudsight/audit-worker.env '${CRAWLER_IMAGE}' node dist/audit-worker.js"
