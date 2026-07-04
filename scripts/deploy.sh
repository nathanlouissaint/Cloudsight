#!/usr/bin/env bash

set -Eeuo pipefail

################################################################################
# CloudSight Deployment Engine
#
# Phase 3.3D
################################################################################

DEPLOY_ROOT="/opt/cloudsight"

CONFIG_DIR="${DEPLOY_ROOT}/config"
LOG_DIR="${DEPLOY_ROOT}/logs"

COMPOSE_FILE="${DEPLOY_ROOT}/docker-compose.yml"
ENV_FILE="${CONFIG_DIR}/.env"

DEPLOY_LOG="${LOG_DIR}/deploy.log"

MAX_HEALTH_RETRIES=30
HEALTH_RETRY_DELAY=10

################################################################################

log() {
    local level="$1"
    shift

    printf "[%s] [%s] %s\n" \
        "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
        "$level" \
        "$*" | tee -a "$DEPLOY_LOG"
}

fail() {
    log ERROR "$*"
    exit 1
}

require_var() {
    local name="$1"

    [[ -n "${!name:-}" ]] || fail "Required variable '$name' is not set."
}

compose() {
    docker compose \
        --env-file "$ENV_FILE" \
        -f "$COMPOSE_FILE" \
        "$@"
}

################################################################################
# Startup
################################################################################

log INFO "=========================================="
log INFO "CloudSight Deployment Engine Starting"
log INFO "=========================================="

################################################################################
# Validation
################################################################################

[[ -d "$DEPLOY_ROOT" ]] || fail "Deployment root missing."
[[ -d "$CONFIG_DIR" ]] || fail "Configuration directory missing."
[[ -d "$LOG_DIR" ]] || fail "Log directory missing."

[[ -f "$COMPOSE_FILE" ]] || fail "docker-compose.yml missing."
[[ -f "$ENV_FILE" ]] || fail ".env missing."

set -a
source "$ENV_FILE"
set +a

require_var GHCR_OWNER
require_var IMAGE_TAG
require_var CONTAINER_REGISTRY_USERNAME
require_var CONTAINER_REGISTRY_PASSWORD

command -v docker >/dev/null || fail "Docker not installed."
command -v docker-compose >/dev/null || fail "Docker Compose not installed."

################################################################################
# Registry Authentication
################################################################################

log INFO "Authenticating to GHCR..."

echo "$CONTAINER_REGISTRY_PASSWORD" \
| docker login ghcr.io \
    --username "$CONTAINER_REGISTRY_USERNAME" \
    --password-stdin

################################################################################
# Deployment
################################################################################

log INFO "Validating Docker Compose..."

compose config >/dev/null

log INFO "Pulling images..."

compose pull

log INFO "Deploying CloudSight..."

compose up -d --remove-orphans

################################################################################
# Wait For Containers
################################################################################

log INFO "Waiting for containers..."

compose ps

################################################################################
# Health Verification
################################################################################

log INFO "Waiting for API health endpoint..."

for ((i=1; i<=MAX_HEALTH_RETRIES; i++)); do

    if curl \
        --silent \
        --fail \
        http://localhost:5001/health \
        >/dev/null
    then

        log INFO "CloudSight API is healthy."
        break

    fi

    if [[ "$i" -eq "$MAX_HEALTH_RETRIES" ]]; then
        fail "Health verification timed out."
    fi

    log INFO "Health check ${i}/${MAX_HEALTH_RETRIES}..."

    sleep "$HEALTH_RETRY_DELAY"

done

################################################################################
# Deployment Summary
################################################################################

log INFO "=========================================="
log INFO "Deployment Summary"
log INFO "=========================================="

compose ps

log INFO "Deployment completed successfully."

################################################################################
# Cleanup
################################################################################

log INFO "Removing dangling Docker layers..."

docker image prune --force

log INFO "Removing unused BuildKit cache..."

docker builder prune --force

log INFO "Deployment cleanup completed."

exit 0
