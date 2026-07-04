#!/usr/bin/env bash

set -euo pipefail

source "$(dirname "$0")/common.sh"

section "Container Health Checks"

timeout 180 bash -c "
until \
[ \"\$(docker inspect -f '{{.State.Health.Status}}' ${POSTGRES_CONTAINER})\" = healthy ] && \
[ \"\$(docker inspect -f '{{.State.Health.Status}}' ${SERVER_CONTAINER})\" = healthy ] && \
[ \"\$(docker inspect -f '{{.State.Health.Status}}' ${CLIENT_CONTAINER})\" = healthy ];
do
    echo 'Waiting...'
    sleep 5
done
"

success "All containers are healthy."
