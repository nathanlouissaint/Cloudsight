variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "common_tags" {
  type = map(string)
}

variable "domain_name" {
  type = string
}

variable "create_hosted_zone" {
  type    = bool
  default = false
}

variable "hosted_zone_id" {
  type    = string
  default = ""
}

variable "validation_domain_names" {
  description = "Domain names requiring ACM DNS validation records. These values must be known during planning."
  type        = list(string)
  default     = []
}

variable "certificate_domain_validation_options" {
  description = "ACM certificate domain validation options."
  type        = any
  default     = []
}
