aws_region   = "us-east-1"
environment  = "production"
project_name = "cloudsight"

vpc_cidr = "10.20.0.0/16"

public_subnet_cidrs = [
  "10.20.1.0/24",
  "10.20.2.0/24"
]

private_subnet_cidrs = [
  "10.20.11.0/24",
  "10.20.12.0/24"
]

availability_zones = [
  "us-east-1a",
  "us-east-1b"
]

password                    = "your_database_password"
jwt_secret                  = "your_long_random_jwt_secret"
container_registry_username = "your_github_username"
container_registry_password = "your_github_pat_with_ghcr_read_access"

enable_acm                     = false
enable_https                   = false
enable_alb_deletion_protection = false