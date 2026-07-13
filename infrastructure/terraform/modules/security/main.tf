resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb"
  description = "Application Load Balancer"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-alb-sg"
    }
  )
}

resource "aws_security_group" "ec2" {
  name        = "${local.name_prefix}-ec2"
  description = "Application Server"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-ec2-sg"
    }
  )
}

resource "aws_security_group" "database" {
  name        = "${local.name_prefix}-database"
  description = "PostgreSQL Database"
  vpc_id      = var.vpc_id

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-database-sg"
    }
  )
}
