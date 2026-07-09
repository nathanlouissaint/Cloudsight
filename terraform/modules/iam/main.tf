data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ec2" {
  name               = "${local.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
  path               = "/cloudsight/"

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-ec2-role"
    }
  )
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-instance-profile"
  path = "/cloudsight/"
  role = aws_iam_role.ec2.name
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

data "aws_iam_policy_document" "cloudwatch" {
  statement {
    effect = "Allow"

    actions = [
      "cloudwatch:PutMetricData",
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents"
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "cloudwatch" {
  name        = "${local.name_prefix}-cloudwatch"
  description = "Allows CloudSight EC2 instances to publish logs and metrics."
  policy      = data.aws_iam_policy_document.cloudwatch.json

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.cloudwatch.arn
}

data "aws_iam_policy_document" "deployment_artifacts" {
  statement {
    sid = "ListDeploymentArtifacts"

    actions = [
      "s3:ListBucket"
    ]

    resources = [
      "arn:aws:s3:::cloudsight-production-deployment-artifacts"
    ]
  }

  statement {
    sid = "ReadDeploymentArtifacts"

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "arn:aws:s3:::cloudsight-production-deployment-artifacts/*"
    ]
  }
}

resource "aws_iam_policy" "deployment_artifacts" {
  name        = "${var.project_name}-${var.environment}-deployment-artifacts"
  description = "Read deployment artifacts from S3"

  policy = data.aws_iam_policy_document.deployment_artifacts.json
}
resource "aws_iam_role_policy_attachment" "deployment_artifacts" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.deployment_artifacts.arn
}

data "aws_iam_policy_document" "parameter_store" {
  statement {
    sid    = "ReadCloudSightParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath"
    ]

    resources = [
      "arn:aws:ssm:*:*:parameter/cloudsight/production/*"
    ]
  }
}

resource "aws_iam_policy" "parameter_store" {
  name        = "${local.name_prefix}-parameter-store"
  description = "Allow CloudSight EC2 instances to read production parameters."

  policy = data.aws_iam_policy_document.parameter_store.json

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "parameter_store" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.parameter_store.arn
}