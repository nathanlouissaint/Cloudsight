#!/usr/bin/env bash

set -Eeuo pipefail

VERSION="${1:-v2.8.1-alpha}"
BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

BUILD_DIR="${ROOT_DIR}/build/deployment"
PACKAGE_DIR="${BUILD_DIR}/cloudsight-deploy"

log() {
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [package] $*"
}

fail() {
    log "ERROR: $*"
    exit 1
}

require_file() {
    [[ -f "$1" ]] || fail "Required file missing: $1"
}

log "Cleaning previous build"

rm -rf "${PACKAGE_DIR}"
mkdir -p "${PACKAGE_DIR}"

mkdir -p \
    "${PACKAGE_DIR}/config" \
    "${PACKAGE_DIR}/scripts"

log "Generating deployment manifest"

cat > "${PACKAGE_DIR}/manifest.json" <<EOF
{
  "project": "CloudSight",
  "version": "${VERSION}",
  "created_at": "${BUILD_TIME}",
  "docker_compose": "docker-compose.prod.yml",
  "scripts": [
    "stage-assets.sh",
    "deploy.sh",
    "validate-bootstrap.sh"
  ]
}
EOF

require_file "${PACKAGE_DIR}/manifest.json"

log "Validating deployment assets"

require_file "${ROOT_DIR}/docker-compose.prod.yml"
require_file "${ROOT_DIR}/config/.env.production.template"
require_file "${ROOT_DIR}/scripts/stage-assets.sh"
require_file "${ROOT_DIR}/scripts/deploy.sh"
require_file "${ROOT_DIR}/scripts/validate-bootstrap.sh"

log "Copying deployment assets"

install -m 644 \
    "${ROOT_DIR}/docker-compose.prod.yml" \
    "${PACKAGE_DIR}/docker-compose.prod.yml"

install -m 600 \
    "${ROOT_DIR}/config/.env.production.template" \
    "${PACKAGE_DIR}/config/.env.production.template"

install -m 755 \
    "${ROOT_DIR}/scripts/stage-assets.sh" \
    "${PACKAGE_DIR}/scripts/stage-assets.sh"

install -m 755 \
    "${ROOT_DIR}/scripts/deploy.sh" \
    "${PACKAGE_DIR}/scripts/deploy.sh"

install -m 755 \
    "${ROOT_DIR}/scripts/validate-bootstrap.sh" \
    "${PACKAGE_DIR}/scripts/validate-bootstrap.sh"

ARCHIVE="${BUILD_DIR}/cloudsight-deploy-${VERSION}.tar.gz"

log "Creating deployment archive"

tar -czf "${ARCHIVE}" \
    -C "${BUILD_DIR}" \
    cloudsight-deploy

require_file "${ARCHIVE}"

log "Deployment package created successfully"

echo
echo "Archive:"
echo "${ARCHIVE}"

echo
echo "Contents:"
tar -tzf "${ARCHIVE}"