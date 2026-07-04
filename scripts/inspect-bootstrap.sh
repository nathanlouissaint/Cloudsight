#!/usr/bin/env bash

set -Eeuo pipefail

usage() {
    echo "Usage: $0 <ec2-host-or-ip> [ssh-user]"
    echo
    echo "Example:"
    echo "  $0 12.34.56.78"
    echo "  $0 ec2-12-34-56-78.compute-1.amazonaws.com ec2-user"
}

if [[ $# -lt 1 ]]; then
    usage
    exit 1
fi

HOST="$1"
SSH_USER="${2:-ec2-user}"

ssh \
    -o StrictHostKeyChecking=accept-new \
    "${SSH_USER}@${HOST}" <<'REMOTE_EOF'
set -Eeuo pipefail

section() {
    echo
    echo "=================================================="
    echo "$1"
    echo "=================================================="
}

section "cloud-init status"
cloud-init status --long || true

section "cloud-init output log"
sudo tail -300 /var/log/cloud-init-output.log || true

section "CloudSight bootstrap log"
sudo tail -300 /var/log/cloudsight-bootstrap.log || true

section "CloudSight deployment log"
sudo tail -300 /opt/cloudsight/logs/deploy.log || true

section "Docker version"
docker --version || true

section "Docker Compose version"
docker compose version || true
docker-compose version || true

section "Docker service status"
sudo systemctl status docker --no-pager || true

section "Docker images"
docker images || true

section "Docker containers"
docker ps -a || true

section "CloudSight Compose status"
docker compose \
    --env-file /opt/cloudsight/config/.env \
    -f /opt/cloudsight/docker-compose.yml \
    ps || true

section "CloudSight local health"
curl -v http://localhost:5001/health || true

section "Bootstrap success marker"
sudo grep -n "BOOTSTRAP VALIDATION PASSED" /var/log/cloudsight-bootstrap.log || true
REMOTE_EOF
