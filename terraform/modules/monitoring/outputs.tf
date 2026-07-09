output "log_group_name" {
  value = aws_cloudwatch_log_group.application.name
}

output "cpu_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.cpu_high.arn
}

output "status_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.status_check.arn
}

output "alb_5xx_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.alb_5xx_high.arn
}

output "alb_response_time_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.alb_response_time_high.arn
}

output "target_group_unhealthy_hosts_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.target_group_unhealthy_hosts.arn
}

output "target_group_healthy_hosts_low_alarm_arn" {
  value = aws_cloudwatch_metric_alarm.target_group_healthy_hosts_low.arn
}
