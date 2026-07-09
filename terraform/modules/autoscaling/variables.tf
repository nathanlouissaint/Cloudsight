variable "project_name" {
  description = "CloudSight project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "common_tags" {
  description = "Common tags applied to all resources."
  type        = map(string)
}

variable "private_subnet_ids" {
  description = "Private subnet IDs."
  type        = list(string)
}

variable "target_group_arn" {
  description = "Application Load Balancer target group ARN."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.small"
}

variable "ec2_security_group_id" {
  description = "EC2 security group ID."
  type        = string
}

variable "instance_profile_name" {
  description = "IAM instance profile name."
  type        = string
}

variable "min_size" {
  description = "Minimum ASG size."
  type        = number
  default     = 1
}

variable "desired_capacity" {
  description = "Desired ASG capacity."
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum ASG size."
  type        = number
  default     = 3
}

variable "target_cpu_utilization" {
  description = "Target average CPU utilization."
  type        = number
  default     = 60
}

variable "artifact_bucket" {
  description = "Deployment artifact S3 bucket."
  type        = string
}

variable "deployment_artifact_key" {
  description = "S3 key of the deployment artifact."
  type        = string
}

variable "deployment_artifact_version" {
  description = "Deployment artifact version."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
}