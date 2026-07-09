resource "aws_acm_certificate_validation" "this" {
  count = var.enable_acm ? 1 : 0

  certificate_arn = module.acm[0].certificate_arn

  validation_record_fqdns = module.route53.validation_record_fqdns
}