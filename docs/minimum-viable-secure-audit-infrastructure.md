# Minimum viable secure audit infrastructure

## Decision

Use an **authenticated job/result broker** in the existing Render API and run
the crawler in an isolated AWS ECS Fargate runtime. The crawler receives only a
scoped broker token and crawler configuration. It receives no `DATABASE_URL`,
`OPENAI_API_KEY`, JWT secret, email provider credential, or migration role.

```text
Browser -> Render API + PostgreSQL -> audit job / authorized report
                    ^        |
                    |        v
                 result  authenticated broker API
                    ^        |
                    |        v
       AWS crawler task -> egress policy/proxy -> audited public page
```

The Render API performs report persistence, deterministic analysis, and optional
OpenAI analysis after it validates a worker result. The crawler only fetches,
enforces robots, and extracts bounded evidence.

## Architecture comparison

| Option | Database credentials in crawler | Network/deployment complexity | Recommended |
| --- | --- | --- | --- |
| Private database worker | Yes, restricted PostgreSQL role | Private database networking across Render/AWS or database migration, firewall, proxy | No |
| Brokered crawler | No; one scoped result token | Isolated crawler, egress proxy/firewall, three narrow broker endpoints | **Yes** |

The broker reduces blast radius and avoids exposing the production database to
the untrusted-crawl runtime. It does not replace network isolation.

## Required AWS controls

1. Run the worker as an ECS Fargate task in a private subnet with no public IP
   and no ECS task role or instance profile.
2. Give the worker security group outbound access only to the egress proxy on
   TCP 3128 (and the VPC DNS resolver). Broker traffic is sent through that
   proxy too; do not permit direct HTTPS or a general NAT route from the worker
   security group.
3. Place the egress proxy in a separate subnet/security group. It is the only
   component allowed to use NAT/public egress. Its ACL must deny private,
   loopback, link-local, metadata, reserved, multicast, and IPv6 internal
   targets after proxy-side DNS resolution.
4. Apply the same address policy in an AWS Network Firewall when a firewall
   route is available. For the first production launch, this remains the
   required independent verification boundary for proxy bypass and DNS changes.
5. Disable IPv6 in the task subnet, or enforce equivalent IPv6 denies in both
   Network Firewall and the proxy.
6. Allow the broker endpoint only from the proxy/NAT egress identity; require
   `Authorization: Bearer` with `AUDIT_WORKER_BROKER_TOKEN`. Rotate it without
   redeploying application code.

The Fargate platform must be verified to expose no usable task metadata or IAM
credentials. The task must not be assigned an IAM role. Treat an accessible
metadata endpoint as a launch blocker even if it contains no credentials.

## Environment separation

### Render API

- `DATABASE_URL`, `WEBSITE_AUDIT_TOKEN_SECRET`
- `AUDIT_WORKER_BROKER_TOKEN`
- Optional: `OPENAI_API_KEY`, `WEBSITE_AUDIT_AI_ENABLED`,
  `WEBSITE_AUDIT_AI_MODEL`

### AWS crawler

- `AUDIT_WORKER_BROKER_URL`
- `AUDIT_WORKER_BROKER_TOKEN`
- `AUDIT_CRAWLER_NETWORK_ISOLATION=enabled` only after the probes below pass
- `AUDIT_CRAWLER_EGRESS_PROXY_URL`
- concurrency and robots cache settings

Never set `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`, email-provider
credentials, AWS credentials, or migrator credentials in the crawler task.

## Cost model (USD/month, us-east-1 estimate)

Assumptions: one continuously running 0.25 vCPU/0.5 GB Fargate crawler, one
matching proxy task, one NAT gateway, one Network Firewall endpoint, and 1 MB
of outbound traffic per audit. Existing Render/API/PostgreSQL/OpenAI costs are
excluded because they are shared with the app.

| Audits/month | Private-DB worker | Brokered worker |
| ---: | ---: | ---: |
| 100 | ~$340–$360 | ~$335–$355 |
| 1,000 | ~$340–$360 | ~$335–$355 |
| 10,000 | ~$342–$365 | ~$337–$360 |

The fixed Network Firewall endpoint dominates low volume. The broker avoids the
additional private database path/role/networking cost and operational burden,
not the egress-isolation cost. A two-AZ design roughly doubles Network Firewall
endpoint cost; use it after the first single-AZ, security-verified launch.

## Deployment, verification, monitoring, rollback

1. Apply migrations using the existing Render/API migrator only.
2. Deploy the API broker endpoints with the token configured but leave public
   audit submission disabled and crawler isolation unset.
3. Deploy the ECS worker/proxy with no database, OpenAI, IAM, or application
   secrets. Start command: `node dist/audit-worker.js`.
4. Verify from the running task that direct connections to localhost, private
   IPv4/IPv6, link-local, metadata, internal DNS, and redirected private targets
   fail at the network boundary. Verify a permitted controlled fixture succeeds.
5. Verify an invalid broker token is rejected; an oversized/malformed result is
   rejected; a worker crash releases its lease; and retries reach terminal
   failure without a duplicate report.
6. Enable `AUDIT_CRAWLER_NETWORK_ISOLATION=enabled`, then enable a small
   internal-only submission cohort. Enable public submission only after alerting
   and the same release's egress evidence are retained.

Monitor broker 401/409/400 rates, job claim/complete/fail latency, lease
recovery, retry exhaustion, rejected result size, proxy denied destinations,
metadata probes, firewall flow logs, and crawler egress volume.

Rollback: stop the ECS service or unset `AUDIT_CRAWLER_NETWORK_ISOLATION`; jobs
remain pending/are recovered by their expired lease, and report access remains
read-only. Revoke `AUDIT_WORKER_BROKER_TOKEN` immediately if a worker is
suspected compromised.

## Production gate

This repository supplies the broker and reference proxy configuration, but it
does not provision AWS route tables, security groups, firewall policies, or
running negative probes. Production crawling is **NO-GO** until those controls
are deployed and independently verified.
