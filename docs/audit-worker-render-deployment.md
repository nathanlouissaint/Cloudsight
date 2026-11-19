# Production audit worker deployment

## Current implementation

The audit worker is a separate, long-running process at `server/src/audit-worker.ts`.
It recovers expired leases at startup, then polls PostgreSQL every second through
`processNextAuditJob`. Jobs, report persistence, retry state, and concurrency
coordination remain in PostgreSQL.

Use the built production command below. Do not use `npm run worker:audit` in a
runtime image because that script uses the development-only `tsx` dependency:

```text
node dist/audit-worker.js
```

The worker has no inbound HTTP interface. On Render, it should therefore be a
Background Worker, not a Web Service or Private Service.

## Required architecture

```text
Browser -> Render API -> PostgreSQL audit job
                           |
                           v
                  isolated audit worker
                    |                 |
             restricted DB role   controlled egress path
                    |                 |
              audit report <--- permitted public HTTPS sites / OpenAI
```

The API service must not execute crawling. In the selected brokered mode the
worker must have no database, JWT, AWS, email-delivery, OpenAI, or API-service
secrets; it receives only the scoped broker token. The database-worker role
below applies only to the legacy direct-worker design.

## Render assessment

Render Background Workers are appropriate for a continuously running process
that polls a queue, and they do not receive public inbound traffic. They can,
however, initiate both private-network and public outbound traffic. Render's
standard service controls document private-network isolation between
environments and inbound IP rules; they do not document an outbound destination
deny policy for a Background Worker.

This is insufficient for a crawler that accepts arbitrary public URLs. The
application's DNS pinning and private-address checks are required defenses, but
they are not a substitute for a network boundary. Do not set
`AUDIT_CRAWLER_NETWORK_ISOLATION=enabled` on a standard Render worker until an
infrastructure-level outbound policy has been independently verified.

Render Sandboxes offer HTTPS egress allowlists, but an allowlist alone cannot
support arbitrary customer domains. A sandbox design would need an approved
egress proxy and an HTTPS job/result API; it cannot use the current direct
PostgreSQL worker protocol without additional design work.

## Recommended production runtime

Keep the public API and report UI on Render. Run the crawler as a dedicated
AWS ECS Fargate service in private subnets with no public IP address. Route all
worker egress through an AWS Network Firewall inspection subnet and NAT
gateway. The firewall/proxy layer, rather than the worker process, must resolve
and reject private, link-local, metadata, reserved, and internal destinations.

The repository includes a reference implementation in
`infrastructure/audit-worker/`:

- `docker-compose.isolated.yml` demonstrates a worker with no direct internet
  network and an egress proxy as its only outbound path.
- `squid.conf` denies known non-public IPv4 ranges, metadata names, unsafe
  ports, and all unapproved clients.
- `postgres-worker-role.sql` is a least-privilege role template.

Those files are reference configuration, not a deployed AWS control plane.
For AWS, disable worker IPv6 unless equivalent IPv6 firewall rules are present,
use dedicated inspection subnets, and apply the same deny policy in Network
Firewall and the proxy. The application supplies `AUDIT_CRAWLER_EGRESS_PROXY_URL`
to send crawler HTTP and HTTPS requests through that proxy; it continues to
validate the initial URL and every redirect before connecting.

### Selected minimum architecture: brokered worker

Use the authenticated broker described in
`docs/minimum-viable-secure-audit-infrastructure.md` for the first production
release. It preserves the existing PostgreSQL job lifecycle inside the Render
API while removing database and OpenAI credentials from the crawler. The worker
claims a job, returns bounded extracted metadata, and reports a sanitized
failure through three token-authenticated API endpoints. The API validates the
result, computes deterministic findings, stores the report, and optionally runs
AI analysis.

### Database and AI connectivity decisions

The current worker uses PostgreSQL directly. A secure ECS deployment therefore
needs either a private PostgreSQL endpoint reachable only from the worker
security group (for example, private RDS) or a redesigned authenticated job and
result broker. Do not expose a Neon or Render database endpoint broadly just to
make crawling work.

The crawler proxy applies only to audited-site traffic. The optional OpenAI
client currently uses a separate HTTPS request path. Keep AI disabled in the
isolated worker until its egress is explicitly permitted only to
`api.openai.com:443` by the firewall/proxy, or until that client is routed via
the same controlled egress layer.

## Required network controls

Use one of these verified designs before enabling production crawling:

1. A separate crawler runtime in a VPC with an egress gateway or proxy that
   resolves destinations itself and denies loopback, RFC1918, CGNAT, link-local,
   ULA, multicast, reserved ranges, and cloud metadata ranges. Permit only
   outbound HTTPS to public destinations plus the database/result channel and
   `api.openai.com` when AI is enabled.
2. A Render Sandbox-based crawler task with outbound HTTPS restricted to an
   approved egress proxy and CloudSight's job/result API. The proxy must apply
   the same address policy after DNS resolution and on every redirect.

In either design, preserve the application's URL validation, DNS rebinding
checks, robots policy enforcement, response-size limit, redirect limit, and
timeout. Those checks are defense in depth, not the network boundary.

## Database roles (legacy direct-worker mode)

Provision three separate principals:

- **API role:** creates jobs and reads token-authorized reports.
- **Worker role:** `SELECT`/`UPDATE` on `WebsiteAuditJob` and
  `SELECT`/`INSERT`/`UPDATE` on `WebsiteAuditReport`; no schema migration,
  authentication, user, organization, or lead-write privileges.
- **Migrator role:** used only by the one-off migration step; not assigned to
  the API or worker.

Use each service's internal database connection where the platform supports it,
TLS for any cross-network database path, and a unique `DATABASE_URL` per role.

## Worker environment checklist

Required for the worker:

- `NODE_ENV=production`
- `AUDIT_WORKER_BROKER_URL` and `AUDIT_WORKER_BROKER_TOKEN`
- `AUDIT_CRAWLER_NETWORK_ISOLATION=enabled` only after network verification
- `AUDIT_CRAWLER_EGRESS_PROXY_URL` pointing to the dedicated egress proxy
- `WEBSITE_AUDIT_GLOBAL_CONCURRENCY`
- `WEBSITE_AUDIT_DOMAIN_CONCURRENCY`
- `WEBSITE_AUDIT_ROBOTS_CACHE_TTL_MS`
- `SENTRY_DSN` and `SENTRY_RELEASE`, when monitoring is used

Required only by the Render API when AI recommendations are enabled:

- `WEBSITE_AUDIT_AI_ENABLED=enabled`
- `OPENAI_API_KEY`
- `WEBSITE_AUDIT_AI_MODEL` (defaults to `gpt-4o-mini`)

The brokered worker does not receive `DATABASE_URL`, `OPENAI_API_KEY`,
`JWT_SECRET`, AWS credentials, Resend credentials, or lead-notification
recipients.

## Deployment sequence

1. Create private worker, inspection, and NAT subnets. Launch the ECS task with
   no public IP and route its default traffic through Network Firewall and NAT;
   do not leave a direct NAT route from the worker subnet.
2. Configure Network Firewall/proxy rules to deny IPv4 private/reserved,
   link-local, cloud-metadata, internal DNS, and IPv6 destinations; allow only
   the required public HTTP/HTTPS traffic, DNS resolver, and database path.
3. Provision the private database path and least-privilege worker role. Confirm
   the role cannot access unrelated tables or execute DDL.
4. Provision the isolated worker runtime and verify egress enforcement with
   private, link-local, metadata, redirect, and DNS-rebinding probes.
5. Apply Prisma migrations once using the migrator role, including the audit
   job/report, AI recommendation, and AI-attempt-marker migrations.
6. Deploy the ECS worker from the server image with start command
   `node dist/audit-worker.js`; do not expose an inbound listener.
7. Configure worker-only secrets and enable `AUDIT_CRAWLER_NETWORK_ISOLATION`
   only after the network probes in step 4 pass.
8. Verify one controlled fixture audit: job claim, robots policy, HTML
   extraction, deterministic report, optional mocked-AI recommendation, valid
   token retrieval, invalid/expired token rejection, and lease recovery.
9. Monitor worker heartbeats, pending/processing/failed job counts, retry
   exhaustion, lease recovery, fetch error codes, AI diagnostic categories,
   OpenAI usage, response-size rejections, and outbound bandwidth.

## Cost estimate

In us-east-1, a continuously running 0.25 vCPU / 0.5 GB Fargate worker is
approximately $9/month before logs and data transfer. AWS Network Firewall is
approximately $284/month for one endpoint ($0.395/hour) plus $0.065/GB; a
two-AZ deployment is approximately $569/month before traffic. NAT, CloudWatch,
database, egress, Render, and OpenAI costs are additional. Use a single-AZ
security-validation environment only for pre-production testing; production
availability requirements determine whether two AZs are necessary.

## Production gate

Production crawling is **NO-GO** until the egress boundary and least-privilege
database role are implemented and independently verified. A standard Render
Background Worker alone does not satisfy that gate.

## DigitalOcean VPS checkpoint

The low-cost deployment candidate is documented in
`infrastructure/audit-worker/vps/README.md`. Before its first paid provisioning:

1. Review `terraform plan` with a strict SSH-admin IP allowlist and immutable
   crawler image digest.
2. Apply only with explicit approval; do not set
   `AUDIT_CRAWLER_NETWORK_ISOLATION=enabled` in Terraform or the worker env.
3. Configure the broker URL/token outside Terraform using
   `scripts/configure-crawler.sh`; the crawler must not receive database,
   OpenAI, JWT, email, or provider credentials.
4. Run `scripts/verify-live.sh`, controlled redirect/DNS-rebinding fixtures,
   broker rejection checks, lease recovery, and a fixture report retrieval.
5. Retain the probe evidence, then make a reviewed change enabling isolation
   and begin with an internal-only audit cohort. Public submissions remain off
   until that cohort is healthy.
