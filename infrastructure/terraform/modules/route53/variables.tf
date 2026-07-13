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

variable "validation_records" {
  type = list(object({
    name  = string
    type  = string
    value = string
  }))
  default = []
}
