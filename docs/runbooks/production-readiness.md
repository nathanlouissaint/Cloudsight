# CloudSight Production Readiness Checklist

Version: v2.1.0-alpha

---

# Purpose

This checklist defines the minimum requirements that must be satisfied before CloudSight is deployed to a live AWS production environment.

Until Phase 12, all validation is performed locally using mock data and offline Terraform validation.

---

# Release Information

Release Version:

Deployment Date:

Approved By:

Rollback Version:

Deployment Window:

---

# Infrastructure

## Terraform

- [ ] terraform fmt completed
- [ ] terraform init -backend=false completed
- [ ] terraform validate completed
- [ ] No validation errors
- [ ] Backend configuration reviewed
- [ ] Variables reviewed
- [ ] Outputs reviewed
- [ ] Module composition reviewed

---

# Docker

- [ ] Production images build successfully
- [ ] Multi-stage builds verified
- [ ] Containers start successfully
- [ ] Container health checks pass
- [ ] Images published to GHCR
- [ ] Immutable image tags available

---

# CI/CD

- [ ] Verification workflow passes
- [ ] Docker workflow passes
- [ ] Smoke tests pass
- [ ] Security scan passes
- [ ] TFLint passes
- [ ] Checkov passes
- [ ] Release workflow verified

---

# Deployment

- [ ] Deployment script validated
- [ ] Rollback script validated
- [ ] Deployment verification passes
- [ ] Deployment metadata generated
- [ ] Deployment history updated

---

# Application

- [ ] React application loads
- [ ] Express API healthy
- [ ] PostgreSQL healthy
- [ ] Health endpoints verified

Endpoints

- /
- /health
- /api/health

---

# Security

- [ ] Secrets not committed
- [ ] Environment variables reviewed
- [ ] Registry authentication verified
- [ ] Docker credentials verified
- [ ] Repository protection enabled

---

# Documentation

- [ ] Deployment Runbook current
- [ ] Operations Runbook current
- [ ] Disaster Recovery Guide current
- [ ] Environment Promotion Guide current
- [ ] Server Setup Guide current

---

# Operational Readiness

- [ ] Deployment window scheduled
- [ ] Rollback plan reviewed
- [ ] Recovery procedures reviewed
- [ ] Monitoring verified
- [ ] Operational checklists reviewed

---

# Go / No-Go Decision

Go

[ ]

No-Go

[ ]

Reason

______________________________________________________

---

# Sign-Off

Engineering

__________________________

Operations

__________________________

Release Manager

__________________________

---

# Phase Status

Current Phase

10.7 — Deployment Readiness

Next Phase

10.8 — Production Readiness Review

Status

Ready for Operational Review
