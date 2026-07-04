#!/usr/bin/env bash

set -euo pipefail

source "$(dirname "$0")/common.sh"

DEPLOYMENT_DIR="deployment"
HISTORY_FILE="${DEPLOYMENT_DIR}/history.log"
ROLLBACK_LOG="${DEPLOYMENT_DIR}/rollback.log"
LAST_DEPLOYMENT_FILE="${DEPLOYMENT_DIR}/last-deployment.json"

if [[ ! -f "${HISTORY_FILE}" ]]; then
    fatal "No deployment history found."
    exit 1
fi

TARGET_IMAGE=$(grep "DEPLOY" "${HISTORY_FILE}" | tail -2 | head -1 | awk -F'|' '{gsub(/ /,"",$3); print $3}')

if [[ -z "${TARGET_IMAGE}" ]]; then
    fatal "Unable to determine rollback target."
    exit 1
fi

export IMAGE_TAG="${TARGET_IMAGE}"

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo
info "Rolling back to ${IMAGE_TAG}"

docker compose -f "${COMPOSE_FILE}" pull

docker compose -f "${COMPOSE_FILE}" up -d

"$(dirname "$0")/healthcheck.sh"

"$(dirname "$0")/verify-deployment.sh"

cat > "${LAST_DEPLOYMENT_FILE}" <<JSON
{
  "imageTag": "${IMAGE_TAG}",
  "operation": "ROLLBACK",
  "timestamp": "${TIMESTAMP}"
}
JSON

echo "${TIMESTAMP} | ROLLBACK | ${IMAGE_TAG}" >> "${HISTORY_FILE}"

cat >> "${ROLLBACK_LOG}" <<LOG
=========================================
Timestamp : ${TIMESTAMP}
Rollback To : ${IMAGE_TAG}
Status : SUCCESS
=========================================

LOG

echo
success "Rollback completed successfully."
echo "Current Image: ${IMAGE_TAG}"
