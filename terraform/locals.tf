locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Repository  = "CloudSight"
    Owner       = "Nathan Louissaint"

  }
  deployment_artifact_key = "releases/${var.deployment_artifact_version}/cloudsight-deploy.tar.gz"
}
