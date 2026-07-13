output "autoscaling_group_name" {
  description = "Auto Scaling Group name."
  value       = aws_autoscaling_group.app.name
}

output "launch_template_id" {
  description = "Launch Template ID."
  value       = aws_launch_template.app.id
}

output "target_tracking_policy_arn" {
  description = "Target tracking scaling policy ARN."
  value       = aws_autoscaling_policy.target_tracking_cpu.arn
}
