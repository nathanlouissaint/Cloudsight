SHELL := /bin/bash

.PHONY: help verify terraform docker smoke security deploy rollback docs clean format lint

help:
	@echo ""
	@echo "CloudSight Developer Commands"
	@echo ""
	@echo "Development"
	@echo "  make verify        Run repository verification"
	@echo "  make docker        Validate Docker configuration"
	@echo "  make terraform     Validate Terraform configuration"
	@echo "  make security      Run security validation"
	@echo "  make smoke         Run production smoke tests"
	@echo ""
	@echo "Deployment"
	@echo "  make deploy        Execute deployment script"
	@echo "  make rollback      Execute rollback script"
	@echo ""
	@echo "Utilities"
	@echo "  make docs          Validate documentation structure"
	@echo "  make clean         Remove temporary files"
	@echo ""

verify:
	npm run verify

terraform:
	terraform -chdir=terraform fmt -recursive
	terraform -chdir=terraform init -backend=false
	terraform -chdir=terraform validate

docker:
	docker compose -f docker-compose.prod.yml config
	docker build -t cloudsight-server-test ./server
	docker build -t cloudsight-client-test ./client

smoke:
	docker compose -f docker-compose.prod.yml up -d --build
	bash scripts/healthcheck.sh
	bash scripts/verify-deployment.sh
	docker compose -f docker-compose.prod.yml down -v

security:
	@echo "Run GitHub Actions security workflow or Checkov locally."

deploy:
	bash scripts/deploy.sh

rollback:
	bash scripts/rollback.sh

docs:
	@test -f docs/runbooks/deployment.md
	@test -f docs/runbooks/operations-runbook.md
	@test -f docs/runbooks/disaster-recovery.md
	@test -f docs/runbooks/environment-promotion.md
	@test -f docs/runbooks/production-readiness.md
	@echo "Documentation verified."

clean:
	docker compose -f docker-compose.prod.yml down -v --remove-orphans || true
	docker image prune -f
	find . -name "*.log" -delete
	find . -name ".DS_Store" -delete
