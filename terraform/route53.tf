module "route53" {
  source = "./modules/route53"

  project_name = var.project_name
  environment  = var.environment

  common_tags = local.common_tags

  domain_name = var.domain_name

  create_hosted_zone = var.create_hosted_zone
  hosted_zone_id     = var.hosted_zone_id

  validation_records = var.enable_acm ? [
    for option in module.acm[0].domain_validation_options : {
      name  = option.resource_record_name
      type  = option.resource_record_type
      value = option.resource_record_value
    }
  ] : []
}
