# CloudSight Server Setup

## Directory Layout

/opt/cloudsight

├── docker-compose.deploy.yml
├── .env
├── deployment/
├── scripts/

## Initial Setup

1. Install Docker.
2. Install Docker Compose.
3. Copy docker-compose.deploy.yml.
4. Copy scripts/.
5. Create .env from .env.production.example.
6. Authenticate the server to GitHub Container Registry.
7. Test:

   IMAGE_TAG=latest ./scripts/deploy.sh

## Deployment

Deployments are initiated automatically by GitHub Actions after a successful publish workflow.
