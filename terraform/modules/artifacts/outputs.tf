output "bucket_name" {
  description = "Deployment artifacts bucket name."
  value       = aws_s3_bucket.deployment_artifacts.bucket
}

output "bucket_arn" {
  description = "Deployment artifacts bucket ARN."
  value       = aws_s3_bucket.deployment_artifacts.arn
}
