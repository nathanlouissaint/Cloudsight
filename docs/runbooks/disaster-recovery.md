# CloudSight Disaster Recovery Guide

Version: v2.1.0-alpha

---

# Purpose

This guide defines the procedures for restoring CloudSight following service disruptions, infrastructure failures, or operational incidents.

The objective is to restore production services in a predictable, repeatable, and verifiable manner while minimizing downtime and data loss.

---

# Scope

This guide applies to:

- Application failures
- Container failures
- Database failures
- Deployment failures
- Host failures
- Registry access failures

It does not yet cover AWS infrastructure recovery. CloudSight is currently operating in local validation mode until Phase 12.

---

# Recovery Objectives

Recovery Time Objective (RTO)

Target:

30 minutes

Recovery Point Objective (RPO)

Target:

15 minutes

---

# System Components

Production Stack

GitHub Actions

↓

GitHub Container Registry

↓

Deployment Host

↓

Docker Compose

↓

Nginx

↓

React Client

↓

Express API

↓

PostgreSQL

---

# Failure Scenarios

## Application Failure

Symptoms

- UI unavailable
- API unavailable
- Failed health checks

Recovery

1. Verify Docker status.
2. Inspect container logs.
3. Restart affected service.
4. Run health verification.
5. Run deployment verification.

---

## Database Failure

Symptoms

- API errors
- Database connection failures

Recovery

1. Verify PostgreSQL container.
2. Inspect database logs.
3. Restart PostgreSQL.
4. Validate connectivity.
5. Verify API health.

---

## Container Failure

Recovery

docker compose -f docker-compose.deploy.yml up -d

Run

./scripts/healthcheck.sh

Run

./scripts/verify-deployment.sh

---

## Deployment Failure

Recovery

./scripts/rollback.sh

Verify

deployment/history.log

Verify

deployment/last-deployment.json

---

## Registry Failure

Symptoms

- Image pull failures
- Authentication errors

Recovery

- Verify GHCR credentials
- Verify repository permissions
- Retry image pull
- Delay deployment until registry access is restored

---

# Recovery Validation

Verify

- React application
- API health
- Database availability
- Container health
- Deployment metadata
- Deployment history

---

# Data Integrity Validation

Confirm

- Database is accessible
- Application starts successfully
- Health endpoints return success
- Latest deployment metadata is present

---

# Communication

During an incident

- Record start time
- Record affected systems
- Record actions taken
- Record recovery completion time

---

# Post-Incident Review

Document

- Root cause
- Timeline
- Impact
- Recovery actions
- Preventive actions
- Lessons learned

---

# Disaster Recovery Testing

Monthly

- Verify rollback procedure
- Validate deployment automation
- Verify recovery documentation

Quarterly

- Perform complete recovery simulation

Annually

- Review disaster recovery objectives
- Update recovery procedures

---

# References

Operations Runbook

docs/runbooks/operations-runbook.md

Deployment Runbook

docs/runbooks/deployment.md

Server Setup

docs/runbooks/server-setup.md

Deployment Metadata

deployment/README.md

Terraform

terraform/

Scripts

scripts/

---

# Revision History

Version

v2.1.0-alpha

Phase

10.7

Status

Active
