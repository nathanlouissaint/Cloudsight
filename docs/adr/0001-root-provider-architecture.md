# ADR-0001: Root Provider Architecture

## Status

Accepted

## Context

CloudSight uses a single root Terraform module.

The root module owns:

- Terraform version constraints
- Provider version constraints
- Provider configuration
- Backend configuration

Child modules are implementation modules only.

## Decision

Child modules SHALL NOT contain:

- terraform {}
- required_version
- required_providers
- provider blocks

Provider inheritance from the root module is used throughout the repository.

## Consequences

Terraform validate succeeds using the root configuration.

TFLint reports warnings when evaluating child modules independently because it cannot infer the root module configuration.

These warnings are accepted and do not block development.
