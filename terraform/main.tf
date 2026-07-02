/*
CloudSight Infrastructure

Root module entry point.

Individual infrastructure modules are composed
through dedicated *.tf files.

Root responsibilities:

- Configure Terraform entry point
- Compose infrastructure modules
- Maintain shared architecture
- Keep business infrastructure separated into
  dedicated root module files

Module composition:

- network.tf
- security.tf
- load_balancer.tf
- compute.tf
- iam.tf
- monitoring.tf
- database.tf

This file intentionally contains no infrastructure
resources to keep the root module clean and
maintainable.
*/