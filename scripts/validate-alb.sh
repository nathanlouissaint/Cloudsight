#!/usr/bin/env bash

set -Eeuo pipefail

usage() {
    echo "Usage: $0 <alb-dns-name>"
    echo
    echo "Example:"
    echo "  $0 cloudsight-prod-alb-123456789.us-east-1.elb.amazonaws.com"
}

if [[ $# -ne 1 ]]; then
    usage
    exit 1
fi

ALB_DNS_NAME="$1"
URL="http://${ALB_DNS_NAME}/health"
BODY_FILE="$(mktemp)"

cleanup() {
    rm -f "$BODY_FILE"
}

trap cleanup EXIT

echo "Validating CloudSight ALB health endpoint..."
echo "URL: ${URL}"

HTTP_STATUS="$(
    curl \
        --silent \
        --show-error \
        --location \
        --connect-timeout 10 \
        --max-time 30 \
        --output "$BODY_FILE" \
        --write-out "%{http_code}" \
        "$URL"
)"

echo
echo "HTTP status: ${HTTP_STATUS}"
echo
echo "Response body:"
cat "$BODY_FILE"
echo

if [[ "$HTTP_STATUS" != "200" ]]; then
    echo "ALB validation FAILED."
    exit 1
fi

echo "ALB validation PASSED."
