# Phase 12.1D — Production Bootstrap Validation

Version: v2.7.1-alpha

## Objective

Validate that a fresh EC2 instance can bootstrap CloudSight into a fully operational production server with zero manual intervention.

This phase does not redesign infrastructure, remove production features, or execute Terraform apply. It adds validation, observability, hardening, inspection tooling, and smoke-test commands before the first live AWS deployment.

## Bootstrap Validation Scope

The EC2 bootstrap process validates:

- System package installation
- Docker installation
- Docker daemon startup
- Docker Compose installation
- `/opt/cloudsight` filesystem creation
- `/opt/cloudsight/docker-compose.yml`
- `/opt/cloudsight/config/.env`
- `/opt/cloudsight/scripts/deploy.sh`
- Docker Compose configuration rendering
- GHCR login path
- Image pull results
- Container startup
- Local API health endpoint
- Final bootstrap success marker

## Pre-Apply Validation Commands

Run these before any live deployment:

```bash
terraform -chdir=terraform fmt -recursive
terraform -chdir=terraform validate
terraform -chdir=terraform plan
make verify
```
