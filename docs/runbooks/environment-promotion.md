# CloudSight Environment Promotion Guide

Version: v2.1.0-alpha

---

# Purpose

This document defines the standard process for promoting CloudSight releases through each deployment environment.

The objective is to ensure deployments are repeatable, auditable, and consistently validated before reaching production.

---

# Promotion Flow

Development

↓

Feature Validation

↓

Staging

↓

Production Readiness Review

↓

Production

---

# Environment Definitions

## Development

Purpose

- Active feature development
- Local testing
- Mock data
- Terraform validation without AWS

Validation

- Unit tests
- Docker build
- Terraform fmt
- Terraform validate

---

## Staging

Purpose

- Release candidate validation
- Integration testing
- Operational verification

Validation

- Container startup
- API validation
- Health checks
- Smoke tests
- Deployment verification

---

## Production

Purpose

Serve customer traffic using approved release artifacts.

Deployment Requirements

- Approved release
- Successful staging validation
- Successful CI/CD pipeline
- Rollback plan available
- Deployment window approved

---

# Promotion Requirements

A release may only advance when all of the following are complete.

Source Control

- All changes merged
- Clean main branch
- Version tagged

Infrastructure

- Terraform fmt
- Terraform validate
- No validation errors

Containers

- Images published
- Immutable image tags available
- Images stored in GHCR

Deployment

- Deployment script verified
- Rollback verified
- Deployment history operational

Documentation

- Runbooks current
- Recovery documentation current
- Operational documentation current

---

# Promotion Checklist

Development → Staging

- Code review complete
- CI successful
- Docker images published
- Version identified

Staging → Production

- Smoke tests passed
- Health checks passed
- Rollback verified
- Operations approval
- Deployment window confirmed

---

# Rollback Criteria

Rollback immediately if any of the following occur.

- Failed health checks
- API unavailable
- Database unavailable
- Critical application failure
- Deployment verification failure

Execute

./scripts/rollback.sh

---

# Release Verification

Verify

- React application
- API
- Database
- Health endpoints
- Deployment metadata
- Deployment history

---

# Operational Artifacts

Deployment Metadata

deployment/last-deployment.json

Deployment Journal

deployment/history.log

Rollback Log

deployment/rollback.log

---

# References

Operations Runbook

docs/runbooks/operations-runbook.md

Deployment Runbook

docs/runbooks/deployment.md

Disaster Recovery

docs/runbooks/disaster-recovery.md

Server Setup

docs/runbooks/server-setup.md

Deployment Metadata

deployment/README.md

---

# Revision History

Version

v2.1.0-alpha

Phase

10.7

Status

Active
