variable "project_name" {
  description = "CloudSight project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs."
  type        = list(string)
}

variable "database_security_group_id" {
  description = "Database security group ID."
  type        = string
}

variable "common_tags" {
  description = "Common tags."
  type        = map(string)
}

variable "engine_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "16"
}

variable "instance_class" {
  description = "Database instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage (GB)."
  type        = number
  default     = 20
}

variable "database_name" {
  description = "Initial database name."
  type        = string
  default     = "cloudsight"
}

variable "username" {
  description = "Database administrator username."
  type        = string
  default     = "cloudsight"
}

variable "password" {
  description = "Database administrator password."
  type        = string
  sensitive   = true
}
