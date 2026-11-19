#!/usr/bin/env bash
set -euo pipefail
base="$(cd "$(dirname "$0")" && pwd)"
terraform -chdir="$base/digitalocean" fmt -check -recursive
bash -n "$base/scripts/configure-crawler.sh" "$base/scripts/verify-live.sh"
grep -q 'policy drop' "$base/cloud-init/crawler.yaml.tftpl"
grep -q 'tcp dport 3128 accept' "$base/cloud-init/crawler.yaml.tftpl"
grep -q 'ip6 daddr ::/0 drop' "$base/cloud-init/crawler.yaml.tftpl"
grep -q 'blocked_v4' "$base/cloud-init/proxy.yaml.tftpl"
grep -q 'http_access deny blocked_dst' "$base/cloud-init/proxy.yaml.tftpl"
grep -q 'dns_nameservers 127.0.0.1' "$base/cloud-init/proxy.yaml.tftpl"
! grep -q 'DATABASE_URL\|OPENAI_API_KEY\|JWT_SECRET' "$base/cloud-init/crawler.yaml.tftpl"
echo "VPS static configuration checks passed."
