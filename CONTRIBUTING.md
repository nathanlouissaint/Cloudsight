# Contributing to CloudSight

## Purpose

This document defines the contribution workflow for the CloudSight repository.

## Branch Strategy

- `main`
- `develop`
- `feature/<feature-name>`

Direct commits to `main` are discouraged.

## Pull Requests

Every pull request should:

- Pass all GitHub Actions workflows
- Pass Terraform validation
- Pass Docker validation
- Pass smoke tests
- Include updated documentation when applicable

## Code Standards

### Terraform

- `terraform fmt`
- `terraform validate`

### Shell

- `bash -n`

### Documentation

- Keep runbooks current.
- Update architecture documentation when infrastructure changes.

## Validation

Before submitting changes:

```bash
make verify
make terraform
make docs
```
