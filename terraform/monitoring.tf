module "monitoring" {
  source = "./modules/monitoring"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags

  autoscaling_group_name = module.autoscaling.autoscaling_group_name

  load_balancer_arn_suffix = module.load_balancer.load_balancer_arn_suffix
  target_group_arn_suffix  = module.load_balancer.target_group_arn_suffix

  enable_load_balancer_alarms = true
  enable_target_group_alarms  = true

  alarm_actions = [
    module.sns.topic_arn
  ]
}
