module "acm" {
  source = "./modules/acm"

  project_name = var.project_name
  environment  = var.environment

  common_tags = local.common_tags
}
