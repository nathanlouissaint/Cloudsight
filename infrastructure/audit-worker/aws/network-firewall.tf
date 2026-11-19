# Optional defense-in-depth policy. To enable it, provide a dedicated firewall
# subnet and wire its endpoint into the proxy/NAT route chain after review.
# The worker/proxy security groups and NACLs remain mandatory even when false.
resource "aws_networkfirewall_rule_group" "egress" {
  count    = var.enable_network_firewall ? 1 : 0
  capacity = 100
  name     = "${var.name_prefix}-audit-egress-deny"
  type     = "STATELESS"
  rule_group {
    rules_source {
      stateless_rules_and_custom_actions {
        dynamic "stateless_rule" {
          for_each = local.blocked_ipv4
          content {
            priority = 100 + tonumber(stateless_rule.key)
            rule_definition {
              actions = ["aws:drop"]
              match_attributes {
                destination { address_definition = stateless_rule.value }
                protocols = [6, 17]
              }
            }
          }
        }
      }
    }
  }
}
resource "aws_networkfirewall_firewall_policy" "egress" {
  count = var.enable_network_firewall ? 1 : 0
  name  = "${var.name_prefix}-audit-egress"
  firewall_policy {
    stateless_default_actions          = ["aws:forward_to_sfe"]
    stateless_fragment_default_actions = ["aws:forward_to_sfe"]
    stateless_rule_group_reference {
      priority     = 1
      resource_arn = aws_networkfirewall_rule_group.egress[0].arn
    }
  }
}
resource "aws_networkfirewall_firewall" "egress" {
  count               = var.enable_network_firewall ? 1 : 0
  name                = "${var.name_prefix}-audit-egress"
  firewall_policy_arn = aws_networkfirewall_firewall_policy.egress[0].arn
  vpc_id              = var.vpc_id
  subnet_mapping { subnet_id = var.firewall_subnet_id }
  tags = local.tags
}
