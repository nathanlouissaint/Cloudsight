# Low-cost VPS audit worker

This is a two-DigitalOcean-Droplet production candidate. It preserves Render as
the API, PostgreSQL, job/result broker, report store, and OpenAI boundary.
Neither VPS receives database, OpenAI, JWT, email, or cloud-provider API
credentials.

```text
Render API/broker <- HTTPS through proxy <- crawler VPS
                                          |
                              private VPC TCP 3128 + DNS only
                                          |
                                      proxy VPS -> public web
```

## Security model

- The crawler's provider firewall and nftables output policy allow only the
  proxy private address on TCP 3128 and UDP/TCP 53. It has no general web,
  public DNS, IPv6, localhost, or metadata path.
- The proxy accepts only the VPC CIDR in bootstrap; the provider firewall then
  narrows ingress to the exact crawler private IP.
- The proxy's nftables policy drops non-public IPv4 ranges before allowing web
  ports, disables IPv6, and permits DNS only to explicit recursive resolvers.
- Squid independently resolves names and blocks the same private/reserved and
  metadata targets after resolution. The app keeps its existing DNS pinning,
  redirect checks, robots enforcement, limits, and extraction controls.
- Broker calls also traverse the proxy. The worker remains unable to talk to
  Render or any public address directly.

## Cost estimate

Use two 2 GB basic Droplets for predictable capacity: $12 each/month, or $24.
Weekly backups add 20% each ($4.80 total), for approximately **$28.80/month**.
Provider monitoring is included; retain Squid and worker logs locally for a
short period or forward only sanitized counters. With 100, 1,000, or 10,000
homepage audits/month, compute cost remains about $28.80 because the included
transfer allowance far exceeds the assumed ~1 MB/audit. Add roughly $0.01/GiB
only after pooled transfer allowance is exhausted.

## Deployment steps — approval required before step 4

1. Create a DigitalOcean API token only in the operator environment; never add
   it to `.tfvars`, source, or the crawler.
2. Copy `digitalocean/terraform.tfvars.example` to `terraform.tfvars`; provide
   the exact admin IP allowlist and immutable crawler image digest.
3. Review only:

   ```bash
   cd infrastructure/audit-worker/vps/digitalocean
   terraform init
   terraform fmt -check -recursive
   terraform validate
   terraform plan -out=cloudsight-vps.tfplan
   ```

4. After explicit approval, apply the reviewed plan. This is the first paid
   action:

   ```bash
   terraform apply cloudsight-vps.tfplan
   ```

5. Obtain the private IP outputs, then configure the worker token outside
   Terraform:

   ```bash
   export CRAWLER_HOST=...
   export CRAWLER_IMAGE=ghcr.io/nathanlouissaint/cloudsight-server@sha256:...
   export AUDIT_WORKER_BROKER_URL=https://YOUR_RENDER_API
   export AUDIT_WORKER_BROKER_TOKEN=...
   ./scripts/configure-crawler.sh
   ```

6. Run `verify-live.sh`, controlled redirect/DNS-rebinding fixtures, broker
   401/400/409 tests, lease recovery, and a report-token fixture audit. Only
   then change `AUDIT_CRAWLER_NETWORK_ISOLATION` to `enabled` through a
   reviewed secret update and restart the worker.

## Rollback

Set the crawler container stopped or destroy only the crawler Droplet; expired
leases safely return jobs to pending. Revoke the broker token if compromise is
suspected. Do not remove nftables, proxy ACLs, or URL validation as rollback.

## Known operational limits

This is single-region, single-proxy infrastructure. It is appropriate only for
a controlled low-volume launch. It does not provide browser rendering; keep
JavaScript rendering as a future separate capability. VPS operating system
patching, log rotation, firewall drift detection, and quarterly live security
probes are mandatory owner responsibilities.
