#!/usr/bin/env bash
set -Eeuo pipefail

# --------------------------------------------------
# CloudSight Production Asset Staging
# --------------------------------------------------

TARGET_DIR="/opt/cloudsight"

CONFIG_DIR="${TARGET_DIR}/config"
SCRIPTS_DIR="${TARGET_DIR}/scripts"
APP_LOG_DIR="${TARGET_DIR}/logs"
RUNTIME_DIR="${TARGET_DIR}/runtime"
BACKUP_DIR="${TARGET_DIR}/backups"

# deploy.sh expects the compose file here
COMPOSE_FILE="${TARGET_DIR}/docker-compose.prod.yml"

# Repository or deployment bundle location.
SOURCE_DIR="${SOURCE_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

# System log location.
SYSTEM_LOG_DIR="${LOG_DIR:-/var/log}"
LOG_FILE="${SYSTEM_LOG_DIR}/cloudsight-stage.log"

log() {
    local message
    message="$(date -u +"%Y-%m-%dT%H:%M:%SZ") [stage] $*"

    mkdir -p "${SYSTEM_LOG_DIR}" 2>/dev/null || true

    if touch "${LOG_FILE}" 2>/dev/null; then
        echo "${message}" | tee -a "${LOG_FILE}"
    else
        echo "${message}"
    fi
}

fail() {
    log "ERROR: $*"
    exit 1
}

require_file() {
    local file="$1"
    [[ -f "${file}" ]] || fail "Required file missing: ${file}"
}

install_file() {
    local src="$1"
    local dst="$2"
    local mode="$3"

    require_file "${src}"

    install -D -m "${mode}" "${src}" "${dst}"
}

# URL-encode a value for use in connection strings.
urlencode() {
    python3 -c '
import sys
from urllib.parse import quote
print(quote(sys.argv[1], safe=""))
' "$1"
}

main() {

    log "Starting CloudSight asset staging"

    mkdir -p \
        "${TARGET_DIR}" \
        "${CONFIG_DIR}" \
        "${SCRIPTS_DIR}" \
        "${APP_LOG_DIR}" \
        "${RUNTIME_DIR}" \
        "${BACKUP_DIR}"

    log "Staging Docker Compose"

    install_file \
        "${SOURCE_DIR}/docker-compose.prod.yml" \
        "${COMPOSE_FILE}" \
        644

    log "Staging deployment scripts"

    install_file \
        "${SOURCE_DIR}/scripts/deploy.sh" \
        "${SCRIPTS_DIR}/deploy.sh" \
        755

    install_file \
        "${SOURCE_DIR}/scripts/validate-bootstrap.sh" \
        "${SCRIPTS_DIR}/validate-bootstrap.sh" \
        755

    log "Generating runtime environment from AWS SSM Parameter Store"

    GHCR_USERNAME="$(aws ssm get-parameter \
        --name "/cloudsight/production/ghcr/username" \
        --query "Parameter.Value" \
        --output text)"

    GHCR_TOKEN="$(aws ssm get-parameter \
        --name "/cloudsight/production/ghcr/token" \
        --with-decryption \
        --query "Parameter.Value" \
        --output text)"

    POSTGRES_PASSWORD="$(aws ssm get-parameter \
        --name "/cloudsight/production/postgres/password" \
        --with-decryption \
        --query "Parameter.Value" \
        --output text)"

    JWT_SECRET="$(aws ssm get-parameter \
        --name "/cloudsight/production/jwt/secret" \
        --with-decryption \
        --query "Parameter.Value" \
        --output text)"

    log "Generating runtime environment"

    TEMPLATE_FILE="${SOURCE_DIR}/config/.env.production.template"
    ENV_FILE="${CONFIG_DIR}/.env.production"

    require_file "${TEMPLATE_FILE}"

    # Preserve immutable deployment configuration while removing
    # placeholder values that will be regenerated from AWS SSM.
    grep -vE '^(GHCR_USERNAME|GHCR_TOKEN|POSTGRES_PASSWORD|JWT_SECRET|DATABASE_URL)=' \
        "${TEMPLATE_FILE}" > "${ENV_FILE}"

    POSTGRES_USER="${POSTGRES_USER:-cloudsight}"
    POSTGRES_DB="${POSTGRES_DB:-cloudsight}"

    # URL-encode the password before constructing the connection string.
    POSTGRES_PASSWORD_ENCODED="$(urlencode "${POSTGRES_PASSWORD}")"

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD_ENCODED}@postgres:5432/${POSTGRES_DB}"

    cat >> "${ENV_FILE}" <<EOF
GHCR_USERNAME=${GHCR_USERNAME}
GHCR_TOKEN=${GHCR_TOKEN}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
EOF

    grep -q '^DATABASE_URL=' "${ENV_FILE}" \
        || fail "DATABASE_URL missing from runtime environment"

    if grep -q 'CHANGE_ME' "${ENV_FILE}"; then
        fail "Runtime environment still contains placeholder values"
    fi

    chmod 600 "${ENV_FILE}"
    chown root:root "${ENV_FILE}"

    require_file "${ENV_FILE}"

    grep -q '^CLIENT_IMAGE=' "${ENV_FILE}" \
        || fail "CLIENT_IMAGE missing from runtime environment"

    grep -q '^SERVER_IMAGE=' "${ENV_FILE}" \
        || fail "SERVER_IMAGE missing from runtime environment"

    grep -q '^GHCR_USERNAME=' "${ENV_FILE}" \
        || fail "GHCR_USERNAME missing from runtime environment"

    grep -q '^GHCR_TOKEN=' "${ENV_FILE}" \
        || fail "GHCR_TOKEN missing from runtime environment"

    grep -q '^POSTGRES_PASSWORD=' "${ENV_FILE}" \
        || fail "POSTGRES_PASSWORD missing from runtime environment"

    grep -q '^DATABASE_URL=' "${ENV_FILE}" \
        || fail "DATABASE_URL missing from runtime environment"

    grep -q '^JWT_SECRET=' "${ENV_FILE}" \
        || fail "JWT_SECRET missing from runtime environment"

    log "Runtime environment generated successfully"

    require_file "${COMPOSE_FILE}"
    require_file "${SCRIPTS_DIR}/deploy.sh"
    require_file "${SCRIPTS_DIR}/validate-bootstrap.sh"
    require_file "${CONFIG_DIR}/.env.production"

    chmod 755 \
        "${TARGET_DIR}" \
        "${CONFIG_DIR}" \
        "${SCRIPTS_DIR}" \
        "${APP_LOG_DIR}" \
        "${RUNTIME_DIR}" \
        "${BACKUP_DIR}"

    chmod 644 "${COMPOSE_FILE}"
    chmod 600 "${CONFIG_DIR}/.env.production"

    log "CloudSight asset staging completed successfully"
}

main "$@"