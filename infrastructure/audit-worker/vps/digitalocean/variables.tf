variable "region" { type = string }
variable "ssh_key_fingerprints" { type = list(string) }
variable "admin_ipv4_cidrs" { type = list(string) }
variable "crawler_image" { type = string }
variable "crawler_size" {
  type    = string
  default = "s-1vcpu-2gb"
}
variable "proxy_size" {
  type    = string
  default = "s-1vcpu-2gb"
}
variable "enable_backups" {
  type    = bool
  default = true
}
variable "audit_network_isolation" {
  type    = string
  default = ""
}
