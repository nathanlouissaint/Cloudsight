output "hosted_zone_id" {
  value = local.zone_id
}

output "validation_record_fqdns" {
  value = [
    for record in aws_route53_record.certificate_validation :
    record.fqdn
  ]
}
