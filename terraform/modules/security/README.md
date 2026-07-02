# CloudSight Security Module

## Purpose

Creates the networking security layer for CloudSight infrastructure.

## Resources

- Application Load Balancer Security Group
- EC2 Security Group
- PostgreSQL Database Security Group
- Security Group Ingress Rules

## Inputs

- project_name
- environment
- vpc_id
- common_tags

## Outputs

- alb_security_group_id
- ec2_security_group_id
- database_security_group_id

## Notes

Security group resources are defined in `main.tf`.

Ingress rules are maintained separately in `rules.tf` to improve readability
and scalability as the infrastructure grows.
