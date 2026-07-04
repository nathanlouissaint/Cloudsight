resource "aws_route53_zone" "this" {
  count = var.create_hosted_zone ? 1 : 0

  name = var.domain_name

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-hosted-zone"
    }
  )
}

locals {
  zone_id = (
    var.create_hosted_zone
    ? aws_route53_zone.this[0].zone_id
    : var.hosted_zone_id
  )

  validation_domain_names = toset(var.validation_domain_names)
}

resource "aws_route53_record" "certificate_validation" {
  for_each = local.validation_domain_names

  zone_id = local.zone_id

  name = one([
    for option in var.certificate_domain_validation_options :
    option.resource_record_name
    if option.domain_name == each.key
  ])

  type = one([
    for option in var.certificate_domain_validation_options :
    option.resource_record_type
    if option.domain_name == each.key
  ])

  ttl = 60

  records = [
    one([
      for option in var.certificate_domain_validation_options :
      option.resource_record_value
      if option.domain_name == each.key
    ])
  ]

  allow_overwrite = true
}
