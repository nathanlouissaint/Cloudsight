resource "aws_sns_topic" "alerts" {
  name = "${local.name_prefix}-alerts"

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-alerts"
    }
  )
}

resource "aws_sns_topic_subscription" "email" {
  count = var.email_endpoint != "" ? 1 : 0

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.email_endpoint
}
