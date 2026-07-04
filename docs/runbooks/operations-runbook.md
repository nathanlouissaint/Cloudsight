# CloudSight Operations Runbook

Version: v2.1.0-alpha

---

# Purpose

This runbook defines the standard operating procedures for managing the CloudSight production environment.

It is intended for engineers responsible for deployment, monitoring, maintenance, troubleshooting, and operational recovery.

This document complements the existing deployment and server setup runbooks.

---

# Scope

This runbook covers:

- Production operations
- Deployment verification
- Routine maintenance
- Incident response
- Rollback procedures
- Health monitoring
- Operational validation

It does not cover infrastructure provisioning or Terraform development.

---

# Architecture Overview

Production Stack

GitHub Actions

↓

GitHub Container Registry

↓

Deployment Server

↓

Docker Compose

↓

Nginx Reverse Proxy

↓

React Client

↓

Express API

↓

PostgreSQL

---

# Repository References

Deployment

docs/runbooks/deployment.md

Server Setup

docs/runbooks/server-setup.md

Terraform

terraform/

Scripts

scripts/

Deployment Metadata

deployment/

---

# Startup Procedure

Verify required environment variables.

Verify Docker is running.

Verify GitHub Container Registry credentials.

Deploy:

IMAGE_TAG=<release-tag> ./scripts/deploy.sh

Deployment automatically performs:

- Image pull
- Container startup
- Health validation
- Deployment verification
- Metadata recording
- Deployment history update

---

# Shutdown Procedure

Gracefully stop services.

docker compose -f docker-compose.deploy.yml down

Verify containers have stopped.

docker ps

Expected Result

No CloudSight production containers should remain running.

---

# Health Verification

Run

./scripts/healthcheck.sh

Expected Result

- PostgreSQL Healthy
- Express Healthy
- React Healthy

Application Verification

./scripts/verify-deployment.sh

Checks

- /
- /health
- /api/health

---

# Deployment Validation

Confirm deployment metadata.

cat deployment/last-deployment.json

Review deployment history.

cat deployment/history.log

Expected

Current deployment recorded.

Timestamp present.

Correct IMAGE_TAG.

---

# Monitoring Checklist

Verify

- Docker containers
- Application health
- API availability
- PostgreSQL availability
- Disk utilization
- CPU utilization
- Memory utilization
- Deployment history
- Container restart count

---

# Routine Maintenance

Daily

- Review deployment history
- Verify application health
- Review container status

Weekly

- Review container images
- Remove unused Docker images
- Review deployment logs

Monthly

- Review infrastructure documentation
- Validate rollback procedure
- Review operational documentation
- Update runbooks if required

---

# Incident Response

Severity 1

Examples

- Complete outage
- Database unavailable
- API unavailable

Actions

1. Verify health checks.
2. Review container status.
3. Review deployment history.
4. Execute rollback if required.
5. Verify recovery.

---

Severity 2

Examples

- Partial feature degradation
- Elevated latency

Actions

1. Review logs.
2. Restart affected service.
3. Validate application.
4. Escalate if unresolved.

---

Severity 3

Examples

- Cosmetic issue
- Documentation issue

Actions

Schedule corrective work during normal development.

---

# Rollback Procedure

Execute

./scripts/rollback.sh

Rollback performs

- Previous deployment discovery
- IMAGE_TAG restoration
- Image pull
- Container recreation
- Health verification
- Deployment verification
- Rollback logging

Validation

Verify

deployment/history.log

Verify

deployment/last-deployment.json

---

# Disaster Recovery

Recovery Priority

1. Restore application
2. Restore API
3. Restore database
4. Validate health
5. Verify deployment metadata

Future disaster recovery procedures are documented separately.

---

# Security Operations

Verify

- Secrets are not committed
- Images originate from GHCR
- Container images are current
- Docker credentials remain valid
- Infrastructure repository remains protected

---

# Operational Checklists

Pre-Deployment

- Docker running
- Registry accessible
- IMAGE_TAG selected
- Environment configured

Deployment

- Execute deployment
- Wait for health checks
- Verify endpoints

Post-Deployment

- Review deployment metadata
- Review deployment history
- Verify application
- Verify API
- Verify logs

---

# Troubleshooting Matrix

Docker Compose Failure

- Verify Docker daemon
- Verify compose file
- Verify registry authentication

Container Unhealthy

- Inspect logs
- Restart service
- Verify dependencies

Application Failure

- Verify API
- Verify database
- Verify reverse proxy

Rollback Failure

- Verify deployment history
- Verify IMAGE_TAG
- Verify registry access

---

# Escalation

Level 1

Application investigation

Level 2

Infrastructure investigation

Level 3

Repository and deployment pipeline investigation

---

# Operational References

Deployment

docs/runbooks/deployment.md

Server Setup

docs/runbooks/server-setup.md

Deployment Metadata

deployment/README.md

Terraform

terraform/

Automation

scripts/

---

# Revision History

Version

v2.1.0-alpha

Phase

10.7

Status

Active
