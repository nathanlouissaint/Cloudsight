# CloudSight Current State

Version: **v2.8.7-alpha (In Progress)**

---

# Project Status

**Status**

Active Development

**Overall Progress**

**99.999%**

**Current Phase**

**Phase 13 — Immutable Production Deployment Validation**

---

# Executive Summary

CloudSight has successfully validated nearly the entire immutable production deployment pipeline.

The infrastructure has reached the point where brand-new EC2 instances can be provisioned through Auto Scaling, bootstrap themselves using cloud-init, download immutable deployment artifacts from Amazon S3, verify artifact integrity using SHA-256, retrieve runtime secrets from AWS Systems Manager Parameter Store, generate the runtime environment, and begin the application deployment process.

The original production deployment blocker has been completely resolved.

The runtime environment now correctly preserves immutable deployment configuration while securely injecting runtime secrets from AWS Systems Manager Parameter Store.

The deployment has progressed into application startup and ALB health validation.

Current engineering efforts are focused on resolving the final deployment issue preventing the application containers from becoming healthy behind the Application Load Balancer.

---

# Completed Milestones

## Infrastructure

- ✅ Production VPC
- ✅ Public Subnets
- ✅ Private Subnets
- ✅ Internet Gateway
- ✅ NAT Gateway
- ✅ Route Tables
- ✅ Security Groups
- ✅ IAM Roles
- ✅ IAM Instance Profile
- ✅ CloudWatch
- ✅ SNS
- ✅ Application Load Balancer
- ✅ Target Group
- ✅ Auto Scaling Group
- ✅ Launch Template
- ✅ Deployment Artifact Bucket
- ✅ Launch Template Versioning

---

## Immutable Deployment

Successfully validated

- ✅ Deployment packaging
- ✅ Manifest generation
- ✅ SHA-256 checksum generation
- ✅ release.json generation
- ✅ Immutable deployment archives
- ✅ Artifact publication to Amazon S3
- ✅ Runtime artifact download
- ✅ Runtime checksum verification
- ✅ Runtime extraction
- ✅ Runtime staging

---

## Bootstrap

Successfully validated

- ✅ cloud-init
- ✅ Docker installation
- ✅ Docker daemon
- ✅ AWS CLI
- ✅ jq
- ✅ tar
- ✅ unzip
- ✅ coreutils
- ✅ stage-assets.sh execution

---

## Runtime Secret Management

Successfully completed

Secrets are now retrieved dynamically from AWS Systems Manager Parameter Store.

Validated parameters:

- ✅ `/cloudsight/production/ghcr/username`
- ✅ `/cloudsight/production/ghcr/token`
- ✅ `/cloudsight/production/postgres/password`
- ✅ `/cloudsight/production/jwt/secret`

---

## Runtime Environment Generation

Major milestone completed.

Previous behavior:

Runtime `.env.production` contained only:

- GHCR_USERNAME
- GHCR_TOKEN
- POSTGRES_PASSWORD
- JWT_SECRET

Result:

```
CLIENT_IMAGE missing
SERVER_IMAGE missing
```

Root cause:

`stage-assets.sh` completely overwrote `.env.production`.

Implemented solution:

- Preserve immutable deployment configuration from `.env.production.template`
- Remove placeholder secrets
- Inject runtime secrets from AWS Systems Manager
- Validate required runtime variables before deployment

Runtime environment now correctly contains:

- ✅ CLIENT_IMAGE
- ✅ SERVER_IMAGE
- ✅ GHCR_USERNAME
- ✅ GHCR_TOKEN
- ✅ POSTGRES_PASSWORD
- ✅ JWT_SECRET

Original deployment blocker resolved.

---

## Deployment Versioning

Successfully validated.

Deployment artifacts published:

- ✅ v2.8.6-alpha
- ✅ v2.8.7-alpha

Terraform deployment versioning validated.

Launch Template now deploys immutable artifact versions through:

```
deployment_artifact_version
```

Validated deployment:

```
Artifact Version: v2.8.7-alpha
```

---

## Deployment Validation

Successfully verified on EC2.

Validated:

- ✅ Artifact download
- ✅ SHA verification
- ✅ Artifact extraction
- ✅ Runtime staging
- ✅ Runtime environment generation
- ✅ AWS Systems Manager integration
- ✅ Deployment version selection
- ✅ Launch Template updates
- ✅ Auto Scaling instance replacement

---

# Current Blocker

Infrastructure deployment has completed successfully.

Current failure occurs during application deployment.

Observed behavior:

- Deployment reaches `deploy.sh`
- Runtime environment loads successfully
- Containers are not started
- ALB health checks fail
- Auto Scaling replaces the unhealthy instance

Current symptoms:

- Target Group

```
Target.FailedHealthChecks
```

- Auto Scaling

```
WaitingForInstanceWarmup
```

followed by

```
Waiting For ELB Connection Draining
```

The deployment has moved beyond infrastructure and bootstrap.

Current investigation is focused on application startup.

---

# Engineering Investigation

Verified

- ✅ Artifact version is correct
- ✅ Runtime environment is correct
- ✅ CLIENT_IMAGE present
- ✅ SERVER_IMAGE present
- ✅ Secrets present
- ✅ Launch Template updated
- ✅ Auto Scaling uses latest Launch Template

The remaining issue is isolated to the deployment/application startup stage.

---

# Next Engineering Objectives

## Immediate

Monitor the current Auto Scaling Instance Refresh until completion.

Determine whether the replacement instance successfully reaches a healthy state.

---

## Validate Deployment

Verify:

- deployment logs
- docker-compose execution
- image pulls
- container startup
- application health endpoint
- ALB target health

---

## Production Validation

Successfully complete:

```
Launch Template
        ↓
Auto Scaling
        ↓
cloud-init
        ↓
Artifact Download
        ↓
SHA Validation
        ↓
Runtime Environment Generation
        ↓
Docker Login
        ↓
Image Pull
        ↓
Container Startup
        ↓
Application Health Check
        ↓
ALB Healthy
        ↓
Target Group Healthy
        ↓
Instance InService
```

---

# Remaining Milestone

The remaining work is no longer infrastructure engineering.

CloudSight is now in the final production deployment validation stage.

Once application containers become healthy behind the ALB and Auto Scaling completes successfully, Phase 13 will be complete and CloudSight will have achieved its first fully automated immutable production deployment on AWS.

## Phase 14 — Organization Tenancy and RBAC Progress

Current state:

- Business data is organization-owned rather than user-owned.
- Organization membership is enforced through `X-Organization-Id`.
- Request flow is:
  `authenticateToken -> requireOrganizationContext -> requireOrganizationPermission(...) -> controller`.
- Organization roles in use:
  `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`.
- Explicit permission-based RBAC is implemented rather than relying on role ordering.
- Tenant-facing routes now enforce both organization membership and permissions.
- Budget, CloudAccount, CostSnapshot, ServiceCostSnapshot, AlertHistory, and ReportNote paths are tenant-scoped.
- Service analytics was corrected to use organization-scoped snapshot queries.
- Legacy global models and stale repository readers were removed from active runtime paths.
- Unsafe global CostSnapshot and ServiceCostSnapshot readers were removed or replaced with organization-scoped variants.
- AWS collection resolves CloudAccounts through the selected organization before writing snapshots.
- Budget ownership is scoped by:
  `organizationId + year + month`.
- Budget HTTP authorization coverage is active against the dedicated test database.
- Budget organization/RBAC suite passes 16/16 tests.

RBAC policy currently enforced:

- OWNER:
  full current organization permissions
- ADMIN:
  operational write access including budgets and AWS collection
- MEMBER:
  read access plus report-note collaboration
- VIEWER:
  read-only access

Next work:

- Add HTTP tenant-isolation coverage for reports, service analytics, accounts, and cross-organization resource access.
- Expand RBAC HTTP coverage beyond budgets.
- Add organization/member management endpoints and permissions when that product surface is implemented.

### HTTP Tenant Isolation Coverage

Completed:

- Budget organization boundary and RBAC coverage
- Reports tenant isolation and report-note RBAC coverage
- Service analytics tenant isolation coverage
- Account analytics and account-trend tenant isolation coverage
- Cross-organization resource access returns tenant-safe responses
- Combined tenant HTTP regression suite passes 70/70 tests

### Organization & Member Management

Completed:

- Authenticated users can list organizations they belong to
- Selected organization details are available through organization context
- OWNER can rename the current organization
- OWNER and ADMIN can list and manage organization members
- Existing users can be added directly to an organization
- Member roles can be changed between OWNER, ADMIN, MEMBER, and VIEWER
- ADMIN cannot modify or remove an OWNER
- Only OWNER can assign the OWNER role
- The final OWNER cannot be demoted or removed
- Membership mutations are scoped to the selected organization
- Cross-organization membership IDs return tenant-safe 404 responses
- Organization/member HTTP suite passes 31/31 tests
- Combined tenant HTTP regression suite passes 101/101 tests

## CloudSight Product Roadmap — B2B Workspace to Production

### Phase 15 — Organization Creation & Workspace Onboarding
Purpose:
- Allow authenticated users to create organizations intentionally
- Create the Organization and OWNER membership transactionally
- Generate unique organization slugs
- Add validation, conflict handling, and HTTP coverage

### Phase 16 — Frontend Organization Context
Purpose:
- Add an organization switcher
- Persist the selected organization
- Automatically send `X-Organization-Id` with tenant-scoped requests
- Make multi-tenancy visible and usable in the frontend

### Phase 17 — Organization Settings UI
Purpose:
- Display organization details and the current user's role
- Allow OWNER to rename the organization
- Hide unauthorized management controls based on RBAC

### Phase 18 — Team & Member Management UI
Purpose:
- Display organization members
- Add existing CloudSight users
- Change member roles
- Remove members
- Respect OWNER, ADMIN, MEMBER, and VIEWER permissions in the UI

### Phase 19 — Organization Invitations
Purpose:
- Invite users who do not already have a CloudSight account
- Track pending invitations
- Add secure invite tokens and expiration
- Support invitation acceptance and account onboarding

Milestone:
CloudSight B2B Workspace Complete

### Phase 20 — Organization Switching Hardening
Purpose:
- Clear tenant-specific frontend state when switching organizations
- Refetch tenant data after organization changes
- Prevent stale cross-organization data from remaining visible

### Phase 21 — Multi-Cloud-Account Management
Purpose:
- Manage multiple cloud accounts within an organization
- Add account-level settings and metadata
- Support explicit account selection where required

### Phase 22 — AWS Account Onboarding
Purpose:
- Build a guided AWS connection workflow
- Configure role ARN and external ID
- Verify account connectivity
- Surface connection status and onboarding errors

### Phase 23 — Cost Collection Hardening
Purpose:
- Collect data independently for every cloud account
- Remove remaining single-account assumptions
- Track collection failures and last-sync status
- Guarantee correct account attribution

Milestone:
Self-Service Cloud Onboarding Complete

### Phase 24 — Tenant Dashboard Experience
Purpose:
- Build the organization-aware dashboard
- Show spend summaries, account breakdowns, services, trends, and budgets

### Phase 25 — Budget Management UI
Purpose:
- Create and edit organization budgets
- Display monthly budget status and variance
- Apply RBAC to budget-management controls

### Phase 26 — Reports & Notes UI
Purpose:
- Expose reports, exports, and report-note functionality
- Provide role-aware editing and tenant-safe report access

### Phase 27 — Alerts Experience
Purpose:
- Display active alerts and alert history
- Add severity and status filtering
- Provide organization-aware alert details

### Phase 28 — Notifications
Purpose:
- Add proactive email notifications
- Support alert and budget threshold preferences
- Move CloudSight from passive analytics to active FinOps monitoring

### Phase 29 — Audit & Organization Security
Purpose:
- Record membership and role changes
- Track sensitive organization actions
- Provide accountability for who changed what and when

### Phase 30 — Billing & Plans
Purpose:
- Make Organization the commercial customer boundary
- Add subscription plans and usage entitlements
- Integrate billing management

### Phase 31 — Production Readiness
Purpose:
- Complete observability and error telemetry
- Review rate limiting and security controls
- Validate migrations, backups, health checks, and deployment readiness

### Phase 32 — End-to-End B2B Validation
Purpose:
- Validate the complete customer lifecycle
- Test organization creation, AWS onboarding, data collection, dashboards, members, RBAC, reports, and alerts together

Milestone:
Customer-Ready FinOps Product
