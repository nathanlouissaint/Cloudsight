# AWS audit worker deployment stack

This standalone Terraform stack creates a one-AZ, low-volume launch topology.
It is intentionally not composed into the legacy root Terraform stack and is
not applied by CI.

## What it creates

- Private worker and proxy subnets without public IP assignment.
- A worker route table with **no default route**.
- Worker security-group/NACL rules allowing only the proxy on TCP 3128 and the
  VPC resolver on port 53.
- A proxy task with NAT access, Squid as the only crawler egress path, and
  NACL denies for localhost, RFC1918, CGNAT, link-local/metadata, reserved,
  multicast, and other non-public IPv4 ranges.
- ECS Fargate worker/proxy services, private Cloud Map proxy discovery,
  CloudWatch logs, and an error alarm.
- An ECS execution role only; neither task receives a task IAM role. The
  broker token is read by the execution agent from SSM Parameter Store. The
  worker task definition deliberately contains no database or OpenAI secret.
- An optional AWS Network Firewall policy and symmetric route-chain resources.

The supplied proxy image must contain the reviewed `../squid.conf` policy. Do
not use an unreviewed public proxy image in production.

Build and push that image only after review, replacing the registry placeholder:

```bash
docker build -f infrastructure/audit-worker/Dockerfile.proxy -t "$ECR_REPOSITORY:RELEASE" infrastructure/audit-worker
docker push "$ECR_REPOSITORY:RELEASE"
```

## Commands (review only unless explicitly approved)

```bash
cd infrastructure/audit-worker/aws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=cloudsight-audit-worker.tfplan
```

Store the already-generated broker token as a SecureString before planning; do
not place its value in Terraform variables or state:

```bash
aws ssm put-parameter --region "$AWS_REGION" --name /cloudsight/production/audit-worker-broker-token --type SecureString --key-id alias/aws/ssm --value "$AUDIT_WORKER_BROKER_TOKEN" --overwrite
```

Provisioning requires explicit approval:

```bash
terraform apply cloudsight-audit-worker.tfplan
```

After security verification, update only this variable and make a reviewed
plan/apply:

```hcl
audit_network_isolation = "enabled"
```

## Required deployer permissions

The human/CI deployer needs scoped permissions for ECS, EC2 VPC/subnets/routes,
security groups, NACLs, Cloud Map, CloudWatch Logs/Alarms, IAM role/policy
creation, SSM Parameter metadata, and—when enabled—AWS Network Firewall.
It also needs permission to read the ECR image metadata. The ECS **task role**
must remain absent.

## Production verification checklist

Before enabling isolation or public submissions, collect command output and
firewall/proxy logs proving:

1. The task cannot connect directly to `127.0.0.1`, `::1`, RFC1918, CGNAT,
   link-local, cloud-metadata, reserved, multicast, or ULA destinations.
2. The proxy rejects those same destinations by hostname, literal IP, redirect,
   and DNS-rebinding fixture.
3. A wrong broker token receives HTTP 401; malformed/oversized result payloads
   receive HTTP 400; expired claims receive HTTP 409.
4. A killed worker lease is recovered and no duplicate report appears.
5. A controlled public fixture produces one authorized report and an invalid or
   expired report token is rejected.
6. The task has no usable metadata/IAM credential endpoint. Failure of this
   check is a launch blocker.

## Rollback

Set ECS worker desired count to zero or stop the service. Revoke and replace
the broker token if compromise is suspected. Keep report retrieval enabled;
pending claims recover after their leases expire. Do not delete audit records
or weaken network controls as a rollback mechanism.
