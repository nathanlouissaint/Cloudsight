# CloudSight Database Module

## Purpose

Creates the PostgreSQL database layer for CloudSight.

## Resources

- RDS PostgreSQL Instance
- DB Subnet Group

## Inputs

- project_name
- environment
- private_subnet_ids
- database_security_group_id
- common_tags

## Outputs

- db_instance_identifier
- db_instance_endpoint
- db_instance_arn
- db_subnet_group_name
