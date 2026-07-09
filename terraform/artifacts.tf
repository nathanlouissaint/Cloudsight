module "artifacts" {
  source = "./modules/artifacts"

  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}
