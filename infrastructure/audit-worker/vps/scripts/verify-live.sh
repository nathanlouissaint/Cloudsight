#!/usr/bin/env bash
set -euo pipefail

: "${CRAWLER_HOST:?Set CRAWLER_HOST}"
: "${PROXY_PRIVATE_IP:?Set PROXY_PRIVATE_IP}"

remote() { ssh "root@${CRAWLER_HOST}" "$@"; }
must_fail() { if remote "$1"; then echo "UNSAFE: command unexpectedly succeeded: $1" >&2; exit 1; fi; }

remote "nft list ruleset"
remote "test \"$(awk '/nameserver/{print \$2; exit}' /etc/resolv.conf)\" = \"${PROXY_PRIVATE_IP}\""
must_fail "timeout 3 bash -c '</dev/tcp/1.1.1.1/443'"
must_fail "timeout 3 bash -c '</dev/tcp/127.0.0.1/80'"
must_fail "timeout 3 bash -c '</dev/tcp/169.254.169.254/80'"
must_fail "timeout 3 bash -c '</dev/tcp/10.0.0.1/80'"
remote "timeout 3 bash -c '</dev/tcp/${PROXY_PRIVATE_IP}/3128'"
echo "Network negative probes passed. Continue with redirect, DNS-rebinding, broker, lease, and fixture probes before enabling isolation."
