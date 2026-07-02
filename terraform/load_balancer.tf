module "load_balancer" {
  source = "./modules/load_balancer"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.network.vpc_id

  public_subnet_ids = module.network.public_subnet_ids

  alb_security_group_id = module.security.alb_security_group_id

  common_tags = local.common_tags

  certificate_arn = try(
    aws_acm_certificate_validation.this.certificate_arn,
    null
  )
}
