module "acm" {
  count = var.enable_acm ? 1 : 0

  source = "./modules/acm"

  project_name = var.project_name
  environment  = var.environment

  common_tags = local.common_tags

  domain_name = var.domain_name
}