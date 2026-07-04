resource "aws_acm_certificate_validation" "this" {
  certificate_arn = module.acm.certificate_arn

  validation_record_fqdns = module.route53.validation_record_fqdns
}
