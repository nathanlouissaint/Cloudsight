# Terraform Module Standards

## Root Module Responsibilities

The root module owns:

- Terraform version constraints
- Provider version constraints
- Provider configuration
- Backend configuration

Files:

- versions.tf
- providers.tf
- main.tf

## Child Module Responsibilities

Child modules do not define:

- terraform {}
- required_version
- required_providers
- provider blocks

Child modules inherit provider configuration from the root module.

Each module contains only:

- README.md
- locals.tf
- variables.tf
- main.tf
- outputs.tf

Additional files may be introduced when they improve organization (for example, rules.tf for Security).