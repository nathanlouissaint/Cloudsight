#!/usr/bin/env bash

set -euo pipefail

source "$(dirname "$0")/common.sh"

echo "========================================"
echo "CloudSight Deployment Pre-flight Checks"
echo "========================================"
echo



#
# Docker CLI
#

command -v docker >/dev/null 2>&1 \
    || fatal "Docker is not installed."

success "Docker CLI detected."

#
# Docker daemon
#

docker info >/dev/null 2>&1 \
    || fatal "Docker daemon is not running."

success "Docker daemon is running."

#
# Docker Compose
#

docker compose version >/dev/null 2>&1 \
    || fatal "Docker Compose plugin not found."

success "Docker Compose detected."

#
# Compose file
#

[[ -f "${PROJECT_DIR}/${COMPOSE_FILE}" ]] \
    || fatal "${COMPOSE_FILE} not found."

success "Compose file found."

#
# Required credentials
#

[[ -n "${GHCR_USERNAME:-}" ]] \
    || fatal "GHCR_USERNAME is not set."

success "GHCR_USERNAME configured."

[[ -n "${GHCR_TOKEN:-}" ]] \
    || fatal "GHCR_TOKEN is not set."

success "GHCR_TOKEN configured."

#
# IMAGE_TAG
#

if [[ -z "${IMAGE_TAG:-}" ]]; then
    warn "IMAGE_TAG not specified. Using 'latest'."
else
    success "IMAGE_TAG=${IMAGE_TAG}"
fi

#
# Deployment directory
#

mkdir -p "${PROJECT_DIR}/deployment"

success "Deployment directory ready."

#
# Port availability
#

for PORT in 3000 5432; do
    if lsof -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; then
        warn "Port ${PORT} is already in use."
    else
        success "Port ${PORT} available."
    fi
done

#
# Disk space
#

AVAILABLE_GB=$(df -Pk "${PROJECT_DIR}" | awk 'NR==2 { printf "%.0f", $4/1024/1024 }')

if [[ "${AVAILABLE_GB}" -lt 5 ]]; then
    warn "Only ${AVAILABLE_GB} GB free."
else
    success "${AVAILABLE_GB} GB available."
fi

echo
echo "Pre-flight validation completed successfully."
