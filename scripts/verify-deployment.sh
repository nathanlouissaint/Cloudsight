#!/usr/bin/env bash

set -euo pipefail

source "$(dirname "$0")/common.sh"

section "Deployment Verification"

curl --fail --silent "$CLIENT_URL" > /dev/null
success "React available"

curl --fail --silent "$HEALTH_URL" > /dev/null
success "Client health endpoint available"

curl --fail --silent "$API_HEALTH_URL" > /dev/null
success "API health endpoint available"

success "Deployment verification passed."
