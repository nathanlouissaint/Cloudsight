resource "aws_db_subnet_group" "this" {
  name = "${local.name_prefix}-db-subnet-group"

  subnet_ids = var.private_subnet_ids

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-db-subnet-group"
    }
  )
}

resource "aws_db_instance" "postgres" {
  identifier = "${local.name_prefix}-postgres"

  engine         = "postgres"
  engine_version = var.engine_version

  instance_class = var.instance_class

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 2
  storage_encrypted     = true

  db_name  = var.database_name
  username = var.username
  password = var.password

  db_subnet_group_name = aws_db_subnet_group.this.name

  vpc_security_group_ids = [
    var.database_security_group_id
  ]

  publicly_accessible = false

  skip_final_snapshot = true

  deletion_protection = true

  backup_retention_period    = 0
  auto_minor_version_upgrade = true

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-postgres"
    }
  )
}
