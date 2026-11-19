variable "aws_region" { type = string }
variable "name_prefix" { type = string }
variable "vpc_id" { type = string }
variable "availability_zone" { type = string }
variable "worker_subnet_cidr" { type = string }
variable "proxy_subnet_cidr" { type = string }
variable "nat_gateway_id" { type = string }
variable "broker_url" { type = string }
variable "broker_token_ssm_parameter_arn" { type = string }
variable "worker_image" { type = string }
variable "proxy_image" { type = string }
variable "alert_sns_topic_arn" {
  type    = string
  default = null
}
variable "audit_network_isolation" {
  type    = string
  default = ""
}
variable "enable_network_firewall" {
  type    = bool
  default = false
}
variable "firewall_subnet_id" {
  type    = string
  default = null
}
variable "firewall_route_table_id" {
  type    = string
  default = null
}
variable "nat_route_table_id" {
  type    = string
  default = null
}
