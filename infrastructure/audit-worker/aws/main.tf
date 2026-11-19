locals {
  tags             = { Project = "CloudSight", Component = "audit-worker", ManagedBy = "Terraform" }
  blocked_ipv4     = ["0.0.0.0/8", "10.0.0.0/8", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16", "172.16.0.0/12", "192.0.0.0/24", "192.168.0.0/16", "198.18.0.0/15", "224.0.0.0/4", "240.0.0.0/4"]
  vpc_dns_resolver = "${cidrhost(data.aws_vpc.selected.cidr_block, 2)}/32"
}

resource "aws_subnet" "worker" {
  vpc_id                  = var.vpc_id
  cidr_block              = var.worker_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = false
  tags                    = merge(local.tags, { Name = "${var.name_prefix}-audit-worker" })
}
resource "aws_subnet" "proxy" {
  vpc_id                  = var.vpc_id
  cidr_block              = var.proxy_subnet_cidr
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = false
  tags                    = merge(local.tags, { Name = "${var.name_prefix}-audit-proxy" })
}

resource "aws_security_group" "worker" {
  name        = "${var.name_prefix}-audit-worker"
  description = "Crawler: proxy and VPC DNS only"
  vpc_id      = var.vpc_id
  tags        = local.tags
}
resource "aws_security_group" "proxy" {
  name        = "${var.name_prefix}-audit-proxy"
  description = "Crawler egress proxy"
  vpc_id      = var.vpc_id
  tags        = local.tags
}
resource "aws_vpc_security_group_egress_rule" "worker_proxy" {
  security_group_id            = aws_security_group.worker.id
  referenced_security_group_id = aws_security_group.proxy.id
  ip_protocol                  = "tcp"
  from_port                    = 3128
  to_port                      = 3128
}
resource "aws_vpc_security_group_egress_rule" "worker_dns_udp" {
  security_group_id = aws_security_group.worker.id
  cidr_ipv4         = local.vpc_dns_resolver
  ip_protocol       = "udp"
  from_port         = 53
  to_port           = 53
}
resource "aws_vpc_security_group_egress_rule" "worker_dns_tcp" {
  security_group_id = aws_security_group.worker.id
  cidr_ipv4         = local.vpc_dns_resolver
  ip_protocol       = "tcp"
  from_port         = 53
  to_port           = 53
}
resource "aws_vpc_security_group_ingress_rule" "proxy_from_worker" {
  security_group_id            = aws_security_group.proxy.id
  referenced_security_group_id = aws_security_group.worker.id
  ip_protocol                  = "tcp"
  from_port                    = 3128
  to_port                      = 3128
}
resource "aws_vpc_security_group_egress_rule" "proxy_web" {
  security_group_id = aws_security_group.proxy.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 443
}
resource "aws_vpc_security_group_egress_rule" "proxy_dns_udp" {
  security_group_id = aws_security_group.proxy.id
  cidr_ipv4         = local.vpc_dns_resolver
  ip_protocol       = "udp"
  from_port         = 53
  to_port           = 53
}

data "aws_vpc" "selected" { id = var.vpc_id }

resource "aws_route_table" "worker" {
  vpc_id = var.vpc_id
  tags   = merge(local.tags, { Name = "${var.name_prefix}-audit-worker" })
}
resource "aws_route_table_association" "worker" {
  subnet_id      = aws_subnet.worker.id
  route_table_id = aws_route_table.worker.id
}
resource "aws_route_table" "proxy" {
  vpc_id = var.vpc_id
  tags   = merge(local.tags, { Name = "${var.name_prefix}-audit-proxy" })
}
resource "aws_route_table_association" "proxy" {
  subnet_id      = aws_subnet.proxy.id
  route_table_id = aws_route_table.proxy.id
}
resource "aws_route" "proxy_nat" {
  count                  = var.enable_network_firewall ? 0 : 1
  route_table_id         = aws_route_table.proxy.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = var.nat_gateway_id
}
locals {
  firewall_endpoint_id = var.enable_network_firewall ? tolist(aws_networkfirewall_firewall.egress[0].firewall_status[0].sync_states)[0].attachment[0].endpoint_id : null
}
resource "aws_route" "proxy_firewall" {
  count                  = var.enable_network_firewall ? 1 : 0
  route_table_id         = aws_route_table.proxy.id
  destination_cidr_block = "0.0.0.0/0"
  vpc_endpoint_id        = local.firewall_endpoint_id
}
resource "aws_route" "firewall_nat" {
  count                  = var.enable_network_firewall ? 1 : 0
  route_table_id         = var.firewall_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = var.nat_gateway_id
}
resource "aws_route" "nat_return_firewall" {
  count                  = var.enable_network_firewall ? 1 : 0
  route_table_id         = var.nat_route_table_id
  destination_cidr_block = var.proxy_subnet_cidr
  vpc_endpoint_id        = local.firewall_endpoint_id
}

# The worker has no default route. The proxy's NACL denies non-public targets
# before its allow rules; its Squid configuration independently resolves and
# applies the same deny list.
resource "aws_network_acl" "worker" {
  vpc_id     = var.vpc_id
  subnet_ids = [aws_subnet.worker.id]
  tags       = merge(local.tags, { Name = "${var.name_prefix}-audit-worker" })
}
resource "aws_network_acl_rule" "worker_proxy_egress" {
  network_acl_id = aws_network_acl.worker.id
  egress         = true
  rule_number    = 100
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = var.proxy_subnet_cidr
  from_port      = 3128
  to_port        = 3128
}
resource "aws_network_acl_rule" "worker_dns_egress" {
  network_acl_id = aws_network_acl.worker.id
  egress         = true
  rule_number    = 110
  protocol       = "udp"
  rule_action    = "allow"
  cidr_block     = local.vpc_dns_resolver
  from_port      = 53
  to_port        = 53
}
resource "aws_network_acl_rule" "worker_proxy_ingress" {
  network_acl_id = aws_network_acl.worker.id
  egress         = false
  rule_number    = 100
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = var.proxy_subnet_cidr
  from_port      = 1024
  to_port        = 65535
}
resource "aws_network_acl_rule" "worker_dns_ingress" {
  network_acl_id = aws_network_acl.worker.id
  egress         = false
  rule_number    = 110
  protocol       = "udp"
  rule_action    = "allow"
  cidr_block     = local.vpc_dns_resolver
  from_port      = 1024
  to_port        = 65535
}

resource "aws_network_acl" "proxy" {
  vpc_id     = var.vpc_id
  subnet_ids = [aws_subnet.proxy.id]
  tags       = merge(local.tags, { Name = "${var.name_prefix}-audit-proxy" })
}
resource "aws_network_acl_rule" "proxy_deny_private_egress" {
  for_each       = { for index, cidr in local.blocked_ipv4 : index => cidr }
  network_acl_id = aws_network_acl.proxy.id
  egress         = true
  rule_number    = 100 + each.key
  protocol       = "-1"
  rule_action    = "deny"
  cidr_block     = each.value
  from_port      = 0
  to_port        = 0
}
resource "aws_network_acl_rule" "proxy_web_egress" {
  network_acl_id = aws_network_acl.proxy.id
  egress         = true
  rule_number    = 200
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 80
  to_port        = 443
}
resource "aws_network_acl_rule" "proxy_dns_egress" {
  network_acl_id = aws_network_acl.proxy.id
  egress         = true
  rule_number    = 210
  protocol       = "udp"
  rule_action    = "allow"
  cidr_block     = local.vpc_dns_resolver
  from_port      = 53
  to_port        = 53
}
resource "aws_network_acl_rule" "proxy_worker_ingress" {
  network_acl_id = aws_network_acl.proxy.id
  egress         = false
  rule_number    = 100
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = var.worker_subnet_cidr
  from_port      = 3128
  to_port        = 3128
}
resource "aws_network_acl_rule" "proxy_return_ingress" {
  network_acl_id = aws_network_acl.proxy.id
  egress         = false
  rule_number    = 200
  protocol       = "tcp"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 1024
  to_port        = 65535
}
resource "aws_network_acl_rule" "proxy_dns_ingress" {
  network_acl_id = aws_network_acl.proxy.id
  egress         = false
  rule_number    = 210
  protocol       = "udp"
  rule_action    = "allow"
  cidr_block     = local.vpc_dns_resolver
  from_port      = 1024
  to_port        = 65535
}

resource "aws_service_discovery_private_dns_namespace" "audit" {
  name = "audit.internal"
  vpc  = var.vpc_id
  tags = local.tags
}
resource "aws_service_discovery_service" "proxy" {
  name = "egress"
  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.audit.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}
resource "aws_cloudwatch_log_group" "worker" {
  name              = "/cloudsight/audit-worker"
  retention_in_days = 30
  tags              = local.tags
}
resource "aws_cloudwatch_log_group" "proxy" {
  name              = "/cloudsight/audit-proxy"
  retention_in_days = 30
  tags              = local.tags
}
resource "aws_ecs_cluster" "audit" {
  name = "${var.name_prefix}-audit"
  tags = local.tags
}

data "aws_iam_policy_document" "ecs_execution_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "execution" {
  name               = "${var.name_prefix}-audit-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_execution_assume.json
  tags               = local.tags
}
resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
data "aws_iam_policy_document" "execution_secret" {
  statement {
    effect    = "Allow"
    actions   = ["ssm:GetParameters"]
    resources = [var.broker_token_ssm_parameter_arn]
  }
}
resource "aws_iam_role_policy" "execution_secret" {
  name   = "audit-broker-token"
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution_secret.json
}

resource "aws_ecs_task_definition" "proxy" {
  family                   = "${var.name_prefix}-audit-proxy"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.execution.arn
  # No task_role_arn: the proxy and crawler must have no AWS application credentials.
  container_definitions = jsonencode([{ name = "proxy", image = var.proxy_image, essential = true, readonlyRootFilesystem = true, portMappings = [{ containerPort = 3128, protocol = "tcp" }], logConfiguration = { logDriver = "awslogs", options = { awslogs-group = aws_cloudwatch_log_group.proxy.name, awslogs-region = var.aws_region, awslogs-stream-prefix = "proxy" } } }])
}
resource "aws_ecs_task_definition" "worker" {
  family                   = "${var.name_prefix}-audit-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.execution.arn
  # Intentionally no task_role_arn, DATABASE_URL, or OPENAI_API_KEY.
  container_definitions = jsonencode([{ name = "worker", image = var.worker_image, essential = true, readonlyRootFilesystem = true, command = ["node", "dist/audit-worker.js"], environment = [
    { name = "NODE_ENV", value = "production" },
    { name = "AUDIT_WORKER_BROKER_URL", value = var.broker_url },
    { name = "AUDIT_CRAWLER_EGRESS_PROXY_URL", value = "http://egress.audit.internal:3128" },
    { name = "AUDIT_CRAWLER_NETWORK_ISOLATION", value = var.audit_network_isolation },
    { name = "WEBSITE_AUDIT_GLOBAL_CONCURRENCY", value = "2" },
    { name = "WEBSITE_AUDIT_DOMAIN_CONCURRENCY", value = "1" }
  ], secrets = [{ name = "AUDIT_WORKER_BROKER_TOKEN", valueFrom = var.broker_token_ssm_parameter_arn }], logConfiguration = { logDriver = "awslogs", options = { awslogs-group = aws_cloudwatch_log_group.worker.name, awslogs-region = var.aws_region, awslogs-stream-prefix = "worker" } } }])
}
resource "aws_ecs_service" "proxy" {
  name            = "audit-proxy"
  cluster         = aws_ecs_cluster.audit.id
  task_definition = aws_ecs_task_definition.proxy.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = [aws_subnet.proxy.id]
    security_groups  = [aws_security_group.proxy.id]
    assign_public_ip = false
  }
  service_registries { registry_arn = aws_service_discovery_service.proxy.arn }
}
resource "aws_ecs_service" "worker" {
  name            = "audit-worker"
  cluster         = aws_ecs_cluster.audit.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  network_configuration {
    subnets          = [aws_subnet.worker.id]
    security_groups  = [aws_security_group.worker.id]
    assign_public_ip = false
  }
  depends_on = [aws_ecs_service.proxy]
}

resource "aws_cloudwatch_log_metric_filter" "worker_errors" {
  name           = "${var.name_prefix}-audit-worker-errors"
  log_group_name = aws_cloudwatch_log_group.worker.name
  pattern        = "ERROR"
  metric_transformation {
    name      = "AuditWorkerErrors"
    namespace = "CloudSight/Audit"
    value     = "1"
  }
}
resource "aws_cloudwatch_metric_alarm" "worker_errors" {
  alarm_name          = "${var.name_prefix}-audit-worker-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "AuditWorkerErrors"
  namespace           = "CloudSight/Audit"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_actions       = var.alert_sns_topic_arn == null ? [] : [var.alert_sns_topic_arn]
}
