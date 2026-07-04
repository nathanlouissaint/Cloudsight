output "vpc_id" {
  description = "CloudSight VPC"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.network.vpc_cidr_block
}

output "alb_security_group_id" {
  description = "ALB Security Group ID"
  value       = module.security.alb_security_group_id
}

output "ec2_security_group_id" {
  description = "EC2 Security Group ID"
  value       = module.security.ec2_security_group_id
}

output "database_security_group_id" {
  description = "Database Security Group ID"
  value       = module.security.database_security_group_id
}

output "load_balancer_dns_name" {
  description = "Application Load Balancer DNS"
  value       = module.load_balancer.load_balancer_dns_name
}

output "load_balancer_arn" {
  description = "Application Load Balancer ARN"
  value       = module.load_balancer.load_balancer_arn
}

output "target_group_arn" {
  description = "Application Target Group"
  value       = module.load_balancer.target_group_arn
}

output "ec2_role_arn" {
  description = "EC2 IAM Role ARN"
  value       = module.iam.role_arn
}

output "ec2_instance_profile_name" {
  description = "EC2 Instance Profile"
  value       = module.iam.instance_profile_name
}

output "cloudwatch_log_group" {
  description = "CloudWatch Log Group"
  value       = module.monitoring.log_group_name
}

output "cpu_alarm_arn" {
  description = "CloudWatch CPU alarm"
  value       = module.monitoring.cpu_alarm_arn
}

output "status_alarm_arn" {
  description = "CloudWatch status check alarm"
  value       = module.monitoring.status_alarm_arn
}

output "sns_topic_arn" {
  description = "SNS topic ARN for infrastructure alerts"
  value       = module.sns.topic_arn
}
