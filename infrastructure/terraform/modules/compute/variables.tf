variable "project_name" {
  description = "CloudSight project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs."
  type        = list(string)
}

variable "ec2_security_group_id" {
  description = "EC2 security group ID."
  type        = string
}

variable "target_group_arn" {
  description = "Application Load Balancer target group ARN."
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile name."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.small"
}

variable "common_tags" {
  description = "Common tags applied to all resources."
  type        = map(string)
}
