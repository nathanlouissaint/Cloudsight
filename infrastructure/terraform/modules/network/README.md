# Network Module

## Purpose

Creates the foundational AWS networking infrastructure for CloudSight.

## Resources

- VPC
- Internet Gateway
- Public Subnets
- Private Subnets
- Public Route Table
- Private Route Table
- Route Table Associations

## Inputs

- project_name
- environment
- common_tags
- vpc_cidr
- public_subnet_cidrs
- private_subnet_cidrs
- availability_zones

## Outputs

- VPC ID
- Public Subnet IDs
- Private Subnet IDs
- VPC CIDR Block

## Design Decisions

- DNS hostnames enabled
- DNS support enabled
- Public and private network separation
- NAT Gateway intentionally omitted during development
- Tagging standardized through common_tags

## Future Enhancements

- NAT Gateway
- Elastic IP
- VPC Flow Logs
- IPv6 Support
- Network ACLs
