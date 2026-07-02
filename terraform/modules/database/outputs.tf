output "db_instance_identifier" {
  description = "Database instance identifier."
  value       = aws_db_instance.postgres.identifier
}

output "db_instance_endpoint" {
  description = "Database endpoint."
  value       = aws_db_instance.postgres.endpoint
}

output "db_instance_arn" {
  description = "Database ARN."
  value       = aws_db_instance.postgres.arn
}

output "db_subnet_group_name" {
  description = "Database subnet group name."
  value       = aws_db_subnet_group.this.name
}
