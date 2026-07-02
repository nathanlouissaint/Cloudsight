data "aws_ssm_parameter" "amazon_linux_2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "app" {
  ami           = data.aws_ssm_parameter.amazon_linux_2023_ami.value
  instance_type = var.instance_type

  subnet_id = var.public_subnet_ids[0]

  vpc_security_group_ids = [
    var.ec2_security_group_id
  ]

  associate_public_ip_address = true

  iam_instance_profile = var.instance_profile_name

  user_data = file("${path.root}/templates/user_data.sh.tftpl")

  tags = merge(
    local.tags,
    {
      Name = "${local.name_prefix}-app"
    }
  )
}

resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = var.target_group_arn

  target_id = aws_instance.app.id

  port = 80
}
