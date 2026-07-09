module "security" {
  source = "./modules/security"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.network.vpc_id
  common_tags  = local.common_tags

  enable_https = var.enable_https
}