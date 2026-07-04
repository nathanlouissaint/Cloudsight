# Security Policy

## Supported Versions

Current development version:

- v2.1.0-alpha

## Reporting

Security issues should not be reported through public GitHub issues.

Report vulnerabilities privately to the project maintainers.

## Security Practices

CloudSight uses:

- GitHub Actions
- Checkov
- TFLint
- Docker image isolation
- Environment variables for secrets

Secrets must never be committed.

Infrastructure changes must pass Terraform validation before merge.

Container images should originate only from GitHub Container Registry.
