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

get_parameter() {
    local name="$1"
    local required="$2"
    local decrypt="${3:-false}"
    local args=(ssm get-parameter --name "${name}" --query "Parameter.Value" --output text)

    if [[ "${decrypt}" == "true" ]]; then
        args+=(--with-decryption)
    fi

    local value
    if ! value="$(aws "${args[@]}" 2>/dev/null)"; then
        [[ "${required}" == "true" ]] \
            && fail "Required production parameter is unavailable: ${name}"
        printf ''
        return
    fi

    if [[ "${value}" == *$'\n'* || "${value}" == *$'\r'* ]]; then
        fail "Production parameter contains an unsupported line break: ${name}"
    fi

    printf '%s' "${value}"
}

append_env() {
    local name="$1"
    local value="$2"
    local escaped="${value//\'/\'\\\'\'}"
    printf "%s='%s'\n" "${name}" "${escaped}" >> "${ENV_FILE}"
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

    GHCR_USERNAME="$(get_parameter "/cloudsight/production/ghcr/username" true)"
    GHCR_TOKEN="$(get_parameter "/cloudsight/production/ghcr/token" true true)"
    POSTGRES_PASSWORD="$(get_parameter "/cloudsight/production/postgres/password" true true)"
    JWT_SECRET="$(get_parameter "/cloudsight/production/jwt/secret" true true)"
    CSRF_SECRET="$(get_parameter "/cloudsight/production/csrf/secret" true true)"
    CORS_ORIGIN="$(get_parameter "/cloudsight/production/http/cors-origin" true)"

    FRONTEND_AUTH_COMPLETE_URL="$(get_parameter "/cloudsight/production/oauth/frontend-complete-url" false)"
    GOOGLE_CLIENT_ID="$(get_parameter "/cloudsight/production/oauth/google/client-id" false)"
    GOOGLE_CLIENT_SECRET="$(get_parameter "/cloudsight/production/oauth/google/client-secret" false true)"
    GOOGLE_REDIRECT_URI="$(get_parameter "/cloudsight/production/oauth/google/redirect-uri" false)"
    ENTRA_CLIENT_ID="$(get_parameter "/cloudsight/production/oauth/entra/client-id" false)"
    ENTRA_CLIENT_SECRET="$(get_parameter "/cloudsight/production/oauth/entra/client-secret" false true)"
    ENTRA_AUTHORITY="$(get_parameter "/cloudsight/production/oauth/entra/authority" false)"
    ENTRA_REDIRECT_URI="$(get_parameter "/cloudsight/production/oauth/entra/redirect-uri" false)"
    ENTRA_ALLOWED_TENANT_IDS="$(get_parameter "/cloudsight/production/oauth/entra/allowed-tenant-ids" false)"
    GITHUB_CLIENT_ID="$(get_parameter "/cloudsight/production/oauth/github/client-id" false)"
    GITHUB_CLIENT_SECRET="$(get_parameter "/cloudsight/production/oauth/github/client-secret" false true)"
    GITHUB_REDIRECT_URI="$(get_parameter "/cloudsight/production/oauth/github/redirect-uri" false)"

    log "Generating runtime environment"

    TEMPLATE_FILE="${SOURCE_DIR}/config/.env.production.template"
    ENV_FILE="${CONFIG_DIR}/.env.production"

    require_file "${TEMPLATE_FILE}"

    # Preserve immutable deployment configuration while removing
    # placeholder values that will be regenerated from AWS SSM.
    grep -vE '^(GHCR_USERNAME|GHCR_TOKEN|POSTGRES_PASSWORD|JWT_SECRET|CSRF_SECRET|CORS_ORIGIN|DATABASE_URL|FRONTEND_AUTH_COMPLETE_URL|GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_REDIRECT_URI|ENTRA_CLIENT_ID|ENTRA_CLIENT_SECRET|ENTRA_AUTHORITY|ENTRA_REDIRECT_URI|ENTRA_ALLOWED_TENANT_IDS|GITHUB_CLIENT_ID|GITHUB_CLIENT_SECRET|GITHUB_REDIRECT_URI)=' \
        "${TEMPLATE_FILE}" > "${ENV_FILE}"

    POSTGRES_USER="${POSTGRES_USER:-cloudsight}"
    POSTGRES_DB="${POSTGRES_DB:-cloudsight}"

    # URL-encode the password before constructing the connection string.
    POSTGRES_PASSWORD_ENCODED="$(urlencode "${POSTGRES_PASSWORD}")"

    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD_ENCODED}@postgres:5432/${POSTGRES_DB}"

    append_env GHCR_USERNAME "${GHCR_USERNAME}"
    append_env GHCR_TOKEN "${GHCR_TOKEN}"
    append_env POSTGRES_PASSWORD "${POSTGRES_PASSWORD}"
    append_env DATABASE_URL "${DATABASE_URL}"
    append_env JWT_SECRET "${JWT_SECRET}"
    append_env CSRF_SECRET "${CSRF_SECRET}"
    append_env CORS_ORIGIN "${CORS_ORIGIN}"
    append_env FRONTEND_AUTH_COMPLETE_URL "${FRONTEND_AUTH_COMPLETE_URL}"
    append_env GOOGLE_CLIENT_ID "${GOOGLE_CLIENT_ID}"
    append_env GOOGLE_CLIENT_SECRET "${GOOGLE_CLIENT_SECRET}"
    append_env GOOGLE_REDIRECT_URI "${GOOGLE_REDIRECT_URI}"
    append_env ENTRA_CLIENT_ID "${ENTRA_CLIENT_ID}"
    append_env ENTRA_CLIENT_SECRET "${ENTRA_CLIENT_SECRET}"
    append_env ENTRA_AUTHORITY "${ENTRA_AUTHORITY}"
    append_env ENTRA_REDIRECT_URI "${ENTRA_REDIRECT_URI}"
    append_env ENTRA_ALLOWED_TENANT_IDS "${ENTRA_ALLOWED_TENANT_IDS}"
    append_env GITHUB_CLIENT_ID "${GITHUB_CLIENT_ID}"
    append_env GITHUB_CLIENT_SECRET "${GITHUB_CLIENT_SECRET}"
    append_env GITHUB_REDIRECT_URI "${GITHUB_REDIRECT_URI}"

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

    grep -q '^CSRF_SECRET=' "${ENV_FILE}" \
        || fail "CSRF_SECRET missing from runtime environment"

    grep -q '^CORS_ORIGIN=' "${ENV_FILE}" \
        || fail "CORS_ORIGIN missing from runtime environment"

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
