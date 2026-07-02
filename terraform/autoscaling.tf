module "autoscaling" {
  source = "./modules/autoscaling"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  private_subnet_ids = module.network.private_subnet_ids

  target_group_arn      = module.load_balancer.target_group_arn
  ec2_security_group_id = module.security.ec2_security_group_id
  instance_profile_name = module.iam.instance_profile_name
}
