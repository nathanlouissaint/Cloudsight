#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/opt/cloudsight"
LOG_FILE="/var/log/cloudsight-bootstrap-validation.log"
COMPOSE_FILE="${APP_DIR}/docker-compose.prod.yml"
ENV_FILE="${APP_DIR}/config/.env.production"

log() {
  echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [validate] $*" | tee -a "${LOG_FILE}"
}

fail() {
  log "ERROR: $*"
  exit 1
}

main() {
  log "Starting CloudSight bootstrap validation"

  [[ -d "${APP_DIR}" ]] || fail "Missing app directory: ${APP_DIR}"
  [[ -f "${COMPOSE_FILE}" ]] || fail "Missing compose file: ${COMPOSE_FILE}"
  [[ -f "${ENV_FILE}" ]] || fail "Missing env file: ${ENV_FILE}"

  docker info >/dev/null 2>&1 || fail "Docker daemon is unavailable"

  cd "${APP_DIR}"

  log "Checking compose services"
  docker-compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps

  log "Checking container status"
  docker-compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" ps --status running | grep -q . \
    || fail "No running containers found"

HEALTH_URL="${HEALTH_URL:-http://localhost:3000/health}"

log "Checking local health endpoint (${HEALTH_URL})"

for attempt in $(seq 1 30); do
  if curl -fsS "${HEALTH_URL}" >/dev/null 2>&1; then
    log "Health endpoint passed"
    log "Bootstrap validation completed successfully"
    exit 0
  fi

  log "Health check attempt ${attempt}/30 failed; retrying"
  sleep 5
done

  fail "Health endpoint did not become healthy"
}

main "$@"
