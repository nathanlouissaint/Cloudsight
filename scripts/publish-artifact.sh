#!/usr/bin/env bash

set -Eeuo pipefail

VERSION="${1:?Usage: publish-artifact.sh <version>}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

AWS_REGION="${AWS_REGION:-us-east-1}"

log() {
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [publish] $*"
}

fail() {
    log "ERROR: $*"
    exit 1
}

require_file() {
    [[ -f "$1" ]] || fail "Missing file: $1"
}

if [[ -n "${DEPLOY_BUCKET:-}" ]]; then
    BUCKET="${DEPLOY_BUCKET}"
else
    BUCKET="$(
        terraform \
            -chdir="${ROOT_DIR}/terraform" \
            output -raw deployment_artifacts_bucket_name
    )"

    [[ -n "${BUCKET}" ]] || fail "Unable to determine deployment bucket."
fi

ARCHIVE="${ROOT_DIR}/build/deployment/cloudsight-deploy-${VERSION}.tar.gz"

CHECKSUM_FILE="${ARCHIVE}.sha256"

RELEASE_FILE="${ROOT_DIR}/build/deployment/release.json"

S3_PREFIX="releases/${VERSION}"

require_file "${ARCHIVE}"

log "Generating SHA-256 checksum"

shasum -a 256 "${ARCHIVE}" | awk '{print $1}' > "${CHECKSUM_FILE}"

SHA256="$(cat "${CHECKSUM_FILE}")"

log "Generating release metadata"

cat > "${RELEASE_FILE}" <<EOF
{
  "project": "CloudSight",
  "version": "${VERSION}",
  "artifact": "cloudsight-deploy.tar.gz",
  "sha256": "${SHA256}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

log "Validating AWS credentials"

aws sts get-caller-identity >/dev/null

log "Uploading deployment artifact"

aws s3 cp \
    "${ARCHIVE}" \
    "s3://${BUCKET}/${S3_PREFIX}/cloudsight-deploy.tar.gz"

log "Uploading checksum"

aws s3 cp \
    "${CHECKSUM_FILE}" \
    "s3://${BUCKET}/${S3_PREFIX}/cloudsight-deploy.tar.gz.sha256"

log "Uploading release metadata"

aws s3 cp \
    "${RELEASE_FILE}" \
    "s3://${BUCKET}/${S3_PREFIX}/release.json"

log "Verifying uploads"

aws s3api head-object \
    --bucket "${BUCKET}" \
    --key "${S3_PREFIX}/cloudsight-deploy.tar.gz" >/dev/null

aws s3api head-object \
    --bucket "${BUCKET}" \
    --key "${S3_PREFIX}/cloudsight-deploy.tar.gz.sha256" >/dev/null

aws s3api head-object \
    --bucket "${BUCKET}" \
    --key "${S3_PREFIX}/release.json" >/dev/null

log "Artifact publication complete"

echo
echo "Release:"
echo "s3://${BUCKET}/${S3_PREFIX}"