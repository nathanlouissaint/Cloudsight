variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "common_tags" {
  type = map(string)
}

variable "autoscaling_group_name" {
  description = "Auto Scaling Group name."
  type        = string
}

variable "load_balancer_arn_suffix" {
  description = "Application Load Balancer ARN suffix used by CloudWatch metrics."
  type        = string
  default     = null
}

variable "target_group_arn_suffix" {
  description = "Target Group ARN suffix used by CloudWatch metrics."
  type        = string
  default     = null
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "alarm_actions" {
  description = "List of SNS topic ARNs or other CloudWatch alarm actions."

  type = list(string)

  default = []
}
