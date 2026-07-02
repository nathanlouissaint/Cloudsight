module "sns" {
  source = "./modules/sns"

  project_name = var.project_name
  environment  = var.environment

  common_tags = local.common_tags

  email_endpoint = var.alert_email
}
