variable "project_name" {
  description = "CloudSight project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string
}

variable "common_tags" {
  description = "Common resource tags."
  type        = map(string)
}

variable "domain_name" {
  description = "Primary domain name."
  type        = string
  default     = "example.com"
}

variable "subject_alternative_names" {
  description = "Additional domain names."
  type        = list(string)
  default     = []
}
