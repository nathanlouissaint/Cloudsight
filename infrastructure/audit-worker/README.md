# Isolated audit-worker reference configuration

This directory provides a local/reference deployment topology for the audit
worker. It does not enable public crawling and must not be applied to production
without the verification steps in `docs/audit-worker-render-deployment.md`.

## Security properties

- `audit-worker` is attached only to the internal `crawler` network.
- It can contact `audit-egress` on port 3128; this reference topology does not
  model the fixed broker-only egress route required in production.
- `audit-egress` is the only service with an external network attachment.
- Squid denies internal, loopback, link-local, metadata, CGNAT, multicast, and
  reserved IPv4 ranges after destination resolution.
- The application validates each submitted URL and redirect before proxying.

## Important limitations

Docker Compose verifies the network design locally; it is not a substitute for
an AWS VPC route, security-group, network-firewall, and egress-proxy deployment.
Do not attach the worker to a general external Docker network. Production must
allow only its fixed HTTPS broker endpoint in addition to the controlled proxy.
The worker has no `DATABASE_URL` or OpenAI credential; those stay with the
Render API broker, which persists reports and optionally performs AI analysis.

## Database role

`postgres-worker-role.sql` remains available only for the legacy direct-worker
mode. The selected brokered runtime must not receive a PostgreSQL credential.

## Validation

Before production use, prove all of the following from the worker runtime:

1. Direct connections to loopback, RFC1918, link-local, metadata, and internal
   service addresses fail.
2. The proxy rejects those targets for direct URLs and redirect destinations.
3. DNS rebinding is rejected by both the app and proxy layers.
4. Public fixture URLs, robots rules, response limits, leases, and retries work.
5. The worker role cannot read `User`, `WebsiteAuditLead`, or unrelated tables,
   and cannot run DDL.
