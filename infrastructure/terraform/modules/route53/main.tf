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
}

resource "aws_route53_record" "certificate_validation" {
  for_each = var.create_hosted_zone ? {
    for index, record in var.validation_records :
    tostring(index) => record
  } : {}

  zone_id = local.zone_id

  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.value]
}
