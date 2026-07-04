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
variable "ghcr_owner" {
  description = "GitHub Container Registry owner."
  type        = string
}

variable "image_tag" {
  description = "CloudSight container image version."
  type        = string
}

variable "postgres_user" {
  description = "Application PostgreSQL username."
  type        = string
}

variable "postgres_db" {
  description = "Application PostgreSQL database."
  type        = string
}

variable "password" {
  description = "Application PostgreSQL password."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret."
  type        = string
  sensitive   = true
}
variable "container_registry_username" {
  description = "Container registry username."
  type        = string
  sensitive   = true
}

variable "container_registry_password" {
  description = "Container registry password or access token."
  type        = string
  sensitive   = true
}