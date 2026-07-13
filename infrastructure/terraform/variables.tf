variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "project_name" {
  type    = string
  default = "cloudsight"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  type = list(string)

  default = [
    "10.20.1.0/24",
    "10.20.2.0/24"
  ]
}

variable "private_subnet_cidrs" {
  type = list(string)

  default = [
    "10.20.11.0/24",
    "10.20.12.0/24"
  ]
}

variable "availability_zones" {
  type = list(string)

  default = [
    "us-east-1a",
    "us-east-1b"
  ]
}

variable "domain_name" {
  description = "Primary DNS domain for CloudSight."
  type        = string
  default     = "example.com"
}

variable "create_hosted_zone" {
  description = "Whether Terraform should create a Route53 hosted zone."
  type        = bool
  default     = false
}

variable "hosted_zone_id" {
  description = "Existing Route53 hosted zone ID."
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Optional email address for SNS notifications."
  type        = string
  default     = ""
}

variable "password" {
  description = "Database administrator password."
  type        = string
  sensitive   = true
}
variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "container_registry_username" {
  description = "GitHub Container Registry username"
  type        = string
}

variable "container_registry_password" {
  description = "GitHub Container Registry Personal Access Token"
  type        = string
  sensitive   = true
}

variable "enable_acm" {
  description = "Enable ACM certificate provisioning."
  type        = bool
  default     = false
}

variable "enable_https" {
  description = "Enable the HTTPS listener on the Application Load Balancer."
  type        = bool
  default     = false
}

variable "enable_alb_deletion_protection" {
  description = "Enable ALB deletion protection."
  type        = bool
  default     = false
}

variable "deployment_artifact_version" {
  type    = string
  default = "v2.8.7-alpha"
}