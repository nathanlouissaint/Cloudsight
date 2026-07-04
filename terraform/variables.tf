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
variable "ghcr_owner" {
  description = "GitHub Container Registry owner."
  type        = string
  default     = "nathanlouissaint"
}

variable "image_tag" {
  description = "CloudSight image version."
  type        = string
  default     = "v2.6.0-alpha"
}
variable "postgres_user" {
  description = "Application PostgreSQL username."
  type        = string
  default     = "cloudsight_user"
}

variable "postgres_db" {
  description = "Application PostgreSQL database name."
  type        = string
  default     = "cloudsight"
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
  description = "Container registry access token or password."
  type        = string
  sensitive   = true
}
