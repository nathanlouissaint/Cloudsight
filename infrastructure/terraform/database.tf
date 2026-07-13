module "database" {
  source = "./modules/database"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.network.private_subnet_ids

  database_security_group_id = module.security.database_security_group_id

  password = var.password

  common_tags = local.common_tags
}
