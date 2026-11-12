# Security exception: Prisma / deepmerge-ts availability advisory

**Status:** Pending owner approval — not approved

**Owner:** Nathan Louissaint, CloudSight project owner

**Requested review period:** 30 days from approval. Reassess immediately if exploitability changes, Prisma publishes a compatible patch, or deployment/configuration begins accepting Prisma configuration input.

## Finding

| Item | Value |
| --- | --- |
| Advisory | GHSA-ggr8-5vv4-36mx / CVE-2026-40345 |
| Severity | High (availability) |
| Affected package | `deepmerge-ts < 8.0.0` |
| Installed version | `deepmerge-ts@7.1.5` |
| Chain | `@prisma/client@6.19.3` → `prisma@6.19.3` → `@prisma/config@6.19.3` → `deepmerge-ts@7.1.5` |
| Audit findings | Three package findings (`prisma`, `@prisma/config`, and `deepmerge-ts`), one underlying advisory |
| Patched version | `deepmerge-ts@8.0.0` |

The advisory is a stack-exhaustion denial of service when two crafted, recursive JavaScript object graphs are passed to a `deepmerge-ts` public merge API. Plain JSON cannot represent the required recursive graph.

## Runtime exposure and evidence

`npm ls --omit=dev prisma @prisma/config deepmerge-ts` confirms the chain is retained in the server runtime through `@prisma/client`. The server production Dockerfile installs dependencies, prunes development dependencies, and still invokes `npx prisma migrate deploy` at startup.

No CloudSight public API exposes Prisma CLI or Prisma configuration functionality. Source review found Prisma Client database calls only. Public request bodies are parsed as JSON with a 1 MB limit and the Scorecard payload is a strict Zod schema; neither can carry recursive JavaScript object graphs. No application source imports `deepmerge-ts`.

## Compensating controls

- `helmet` is enabled.
- Global JSON and URL-encoded request bodies are limited to 1 MB.
- Global rate limit is 300 requests per 15 minutes.
- `POST /saas-scorecard/leads` has its own limit of 8 requests per 15 minutes.
- The Scorecard route uses a strict Zod contract and a honeypot.
- Production Compose requires `DATABASE_URL` and `JWT_SECRET`, uses a read-only server filesystem, `no-new-privileges`, and a non-root container user.

## Residual risk

The vulnerable package is present at runtime, so the finding cannot be suppressed. Current exploitability is assessed as limited because no untrusted caller can provide the recursive in-memory objects required by the advisory to a reachable merge API. If that precondition changes, impact is process availability, not data confidentiality or integrity.

Startup migrations are an operational risk independent of this advisory: a failed migration can prevent server startup, and migration execution couples database change timing to deployment. Production migrations must be reviewed, backed up, and executed through a controlled release step; this exception does not authorize migration execution.

## Remediation plan

1. Monitor Prisma and `deepmerge-ts` releases weekly during the exception period.
2. Apply a compatible upstream Prisma update when it removes the vulnerable chain; rerun audit, typecheck, builds, and isolated database tests.
3. Do not force `deepmerge-ts@8` under Prisma 6 or use `npm audit fix --force`.
4. Plan and test a separate Prisma major-version upgrade if no compatible backport is published before exception expiry.

## Approval

Approval is required from the CloudSight project owner before release. Record the approving person, date, expiry date, and any additional conditions here. This document does not constitute approval.
