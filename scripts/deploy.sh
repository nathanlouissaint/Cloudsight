#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="cloudsight"
APP_DIR="/opt/cloudsight"
LOG_FILE="/var/log/cloudsight-deploy.log"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"
ENV_FILE="${APP_DIR}/config/.env.production"

log() {
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [deploy] $*" | tee -a "${LOG_FILE}"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_file() {
  local file="$1"
  [[ -f "${file}" ]] || fail "Required file missing: ${file}"
}

require_command() {
  local cmd="$1"
  command -v "${cmd}" >/dev/null 2>&1 || fail "Required command missing: ${cmd}"
}

main() {
  log "Starting CloudSight production deployment"

  require_command docker
  require_file "${COMPOSE_FILE}"
  require_file "${ENV_FILE}"

  cd "${APP_DIR}"

  log "Validating Docker daemon"
  docker info >/dev/null 2>&1 || fail "Docker daemon is unavailable"

  log "Loading runtime environment"
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a

  [[ -n "${GHCR_USERNAME:-}" ]] || fail "GHCR_USERNAME is missing"
  [[ -n "${GHCR_TOKEN:-}" ]] || fail "GHCR_TOKEN is missing"
  [[ -n "${CLIENT_IMAGE:-}" ]] || fail "CLIENT_IMAGE is missing"
  [[ -n "${SERVER_IMAGE:-}" ]] || fail "SERVER_IMAGE is missing"

  log "Authenticating to GHCR"
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USERNAME}" --password-stdin >/dev/null

  log "Validating compose configuration"
  docker-compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" config >/dev/null

  log "Pulling production images"
  docker-compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" pull

  log "Starting production containers"
  docker-compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --remove-orphans

  log "Deployment completed successfully"
}

main "$@"
