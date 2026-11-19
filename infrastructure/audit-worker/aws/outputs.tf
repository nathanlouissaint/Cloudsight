output "worker_security_group_id" { value = aws_security_group.worker.id }
output "proxy_security_group_id" { value = aws_security_group.proxy.id }
output "worker_subnet_id" { value = aws_subnet.worker.id }
output "proxy_subnet_id" { value = aws_subnet.proxy.id }
output "ecs_cluster_name" { value = aws_ecs_cluster.audit.name }
output "worker_log_group" { value = aws_cloudwatch_log_group.worker.name }
