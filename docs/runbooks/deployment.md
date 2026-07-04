# CloudSight Deployment Runbook

## Deployment Flow

GitHub Actions

↓

Publish Images to GHCR

↓

Deploy Workflow

↓

SSH to Production Host

↓

scripts/deploy.sh

↓

docker compose pull

↓

docker compose up -d

↓

Health Checks

↓

Deployment Verification

## Verification

- /
- /health
- /api/health

## Rollback

Rollback support is currently a placeholder.

Future implementation will:

1. Restore previous image tag.
2. Pull previous images.
3. Restart services.
4. Verify health.

## Deployment Metadata

After every successful deployment, deployment/last-deployment.json is updated with:

- Image tag
- Deployment timestamp
