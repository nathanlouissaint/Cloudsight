locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Repository  = "CloudSight"
    Owner       = "Nathan Louissaint"
  }
}
