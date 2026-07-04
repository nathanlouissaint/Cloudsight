module "autoscaling" {
  source = "./modules/autoscaling"

  container_registry_username = var.container_registry_username
  container_registry_password = var.container_registry_password

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  private_subnet_ids = module.network.private_subnet_ids

  target_group_arn      = module.load_balancer.target_group_arn
  ec2_security_group_id = module.security.ec2_security_group_id
  instance_profile_name = module.iam.instance_profile_name

  ghcr_owner = var.ghcr_owner
  image_tag  = var.image_tag

  postgres_user = var.postgres_user
  postgres_db   = var.postgres_db
  password      = var.password
  jwt_secret    = var.jwt_secret
}
