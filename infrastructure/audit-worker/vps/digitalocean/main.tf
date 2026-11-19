locals {
  tags = ["cloudsight", "audit-worker", "production-candidate"]
}

resource "digitalocean_vpc" "audit" {
  name     = "cloudsight-audit-vpc"
  region   = var.region
  ip_range = "10.116.0.0/20"
}

resource "digitalocean_droplet" "proxy" {
  name       = "cloudsight-audit-proxy"
  region     = var.region
  size       = var.proxy_size
  image      = "ubuntu-24-04-x64"
  vpc_uuid   = digitalocean_vpc.audit.id
  ssh_keys   = var.ssh_key_fingerprints
  monitoring = true
  backups    = var.enable_backups
  tags       = concat(local.tags, ["audit-proxy"])
  user_data = templatefile("${path.module}/../cloud-init/proxy.yaml.tftpl", {
    crawler_private_cidr = "10.116.0.0/20"
  })
}

resource "digitalocean_droplet" "crawler" {
  name       = "cloudsight-audit-crawler"
  region     = var.region
  size       = var.crawler_size
  image      = "ubuntu-24-04-x64"
  vpc_uuid   = digitalocean_vpc.audit.id
  ssh_keys   = var.ssh_key_fingerprints
  monitoring = true
  backups    = var.enable_backups
  tags       = concat(local.tags, ["audit-crawler"])
  user_data = templatefile("${path.module}/../cloud-init/crawler.yaml.tftpl", {
    proxy_private_ip        = digitalocean_droplet.proxy.ipv4_address_private
    crawler_image           = var.crawler_image
    audit_network_isolation = var.audit_network_isolation
  })
}

resource "digitalocean_firewall" "crawler" {
  name = "cloudsight-audit-crawler"
  tags = ["audit-crawler"]
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = var.admin_ipv4_cidrs
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "3128"
    destination_addresses = ["${digitalocean_droplet.proxy.ipv4_address_private}/32"]
  }
  outbound_rule {
    protocol              = "udp"
    port_range            = "53"
    destination_addresses = ["${digitalocean_droplet.proxy.ipv4_address_private}/32"]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "53"
    destination_addresses = ["${digitalocean_droplet.proxy.ipv4_address_private}/32"]
  }
}

resource "digitalocean_firewall" "proxy" {
  name = "cloudsight-audit-proxy"
  tags = ["audit-proxy"]
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = var.admin_ipv4_cidrs
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "3128"
    source_addresses = ["${digitalocean_droplet.crawler.ipv4_address_private}/32"]
  }
  inbound_rule {
    protocol         = "udp"
    port_range       = "53"
    source_addresses = ["${digitalocean_droplet.crawler.ipv4_address_private}/32"]
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "53"
    source_addresses = ["${digitalocean_droplet.crawler.ipv4_address_private}/32"]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "80"
    destination_addresses = ["0.0.0.0/0"]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "443"
    destination_addresses = ["0.0.0.0/0"]
  }
  outbound_rule {
    protocol              = "udp"
    port_range            = "53"
    destination_addresses = ["1.1.1.1/32", "1.0.0.1/32"]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "53"
    destination_addresses = ["1.1.1.1/32", "1.0.0.1/32"]
  }
}
