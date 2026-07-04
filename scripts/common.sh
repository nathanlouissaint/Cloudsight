#!/usr/bin/env bash

set -euo pipefail

###############################################################################
# CloudSight Common Configuration
###############################################################################

PROJECT_DIR="${PROJECT_DIR:-/opt/cloudsight}"

COMPOSE_FILE="docker-compose.deploy.yml"

CLIENT_CONTAINER="cloudsight-client-prod"
SERVER_CONTAINER="cloudsight-server-prod"
POSTGRES_CONTAINER="cloudsight-postgres-prod"

IMAGE_TAG="${IMAGE_TAG:-latest}"

CLIENT_URL="http://localhost"
HEALTH_URL="http://localhost/health"
API_HEALTH_URL="http://localhost/api/health"

###############################################################################
# Logging
###############################################################################

timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
    local level="$1"
    shift

    printf "[%s] [%s] %s\n" \
        "$(timestamp)" \
        "$level" \
        "$*"
}

info() {
    log INFO "$@"
}

success() {
    log SUCCESS "$@"
}

warn() {
    log WARNING "$@"
}

error() {
    log ERROR "$@" >&2
}

fatal() {
    error "$@"
    exit 1
}

section() {
    echo
    echo "============================================================"
    echo "$1"
    echo "============================================================"
}

###############################################################################
# Validation Helpers
###############################################################################

require_command() {
    command -v "$1" >/dev/null 2>&1 \
        || fatal "Required command '$1' is not installed."
}

require_file() {
    [[ -f "$1" ]] \
        || fatal "Required file '$1' does not exist."
}

require_directory() {
    mkdir -p "$1"
}

###############################################################################
# Docker Helpers
###############################################################################

compose() {
    docker compose -f "${COMPOSE_FILE}" "$@"
}
