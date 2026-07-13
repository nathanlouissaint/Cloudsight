provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CloudSight"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
