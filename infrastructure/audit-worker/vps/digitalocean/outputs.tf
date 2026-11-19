output "crawler_private_ip" { value = digitalocean_droplet.crawler.ipv4_address_private }
output "proxy_private_ip" { value = digitalocean_droplet.proxy.ipv4_address_private }
output "crawler_public_ip" { value = digitalocean_droplet.crawler.ipv4_address }
output "proxy_public_ip" { value = digitalocean_droplet.proxy.ipv4_address }
