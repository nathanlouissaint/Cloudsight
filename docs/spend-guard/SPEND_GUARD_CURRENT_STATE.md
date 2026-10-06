# CloudSight Spend Guard — Current State & Development Roadmap

**Last Updated:** September 16, 2026  
**Project:** CloudSight  
**Feature:** Spend Guard  
**Branch:** `feature/spend-guard-landing-page`  
**Status:** Active Development

---

# 1. Product Overview

Spend Guard is a focused CloudSight product wedge designed to help AWS customers detect budget risk before their monthly cloud bill arrives.

The goal is to create a shorter path from discovering CloudSight to receiving useful cloud-cost intelligence.

## Core Value Proposition

Spend Guard should answer:

> Are we on track to exceed our AWS budget, why is it happening, and what should we pay attention to?

The initial product focuses on:

- AWS account connection
- Monthly budget configuration
- Current cloud spend
- Projected cloud spend
- Budget-risk detection
- Cost-driver identification
- Actionable cost insight

---

# 2. Funnel Overview

The current funnel is:

```text
Landing Page
     ↓
Private Beta Signup
     ↓
Account Creation
     ↓
Organization Provisioning
     ↓
AWS Connection
     ↓
Budget Setup
     ↓
First Analysis
     ↓
Spend Guard Result
     ↓
Ongoing Monitoring
```

## MVP Goal

A new customer should eventually be able to:

1. Visit the Spend Guard landing page.
2. Join the private beta.
3. Create an account.
4. Automatically receive a CloudSight organization.
5. Connect an AWS account.
6. Configure a monthly AWS budget.
7. Run a cost-risk analysis.
8. See projected budget risk.
9. Understand which AWS services are driving that risk.
10. Return later and retrieve the same configuration and monitoring data.

Until those steps work end-to-end, the funnel should be considered under development.

---

# 3. Current Funnel Status

| Funnel Layer | Status | Notes |
|---|---|---|
| Landing page | ✅ Complete | Public `/spend-guard` page |
| CTA routing | ✅ Complete | React Router navigation |
| Signup UI | ✅ Complete | Private beta signup |
| Signup API | ✅ Complete | Registration request wired |
| User creation | ✅ Complete | PostgreSQL-backed User |
| Organization model | ✅ Confirmed | New multi-tenant DB architecture |
| Organization creation | 🟡 In Progress | Registration transaction being implemented |
| Organization membership | 🟡 In Progress | New user becomes OWNER |
| Authentication | ✅ Working | JWT returned after registration |
| AWS verification UI | ✅ Complete | IAM Role ARN onboarding |
| AWS verification backend | ✅ Working | STS service implemented |
| AWS mock verification | ✅ Working | Development mode available |
| AWS live verification | ⏸ Blocked | Awaiting AWS account access |
| CloudAccount persistence | ❌ Not Complete | Verification not persisted yet |
| Budget UI | ✅ Complete | Setup Step 2 |
| Budget data model | ✅ Complete | Organization-scoped |
| Budget API | 🟡 In Progress | Organization-aware controller added |
| Budget frontend persistence | ❌ Not Complete | Continue button not wired |
| Analysis review UI | ✅ Shell Complete | Setup Step 3 |
| Analysis engine | ❌ Not Wired | Needs new snapshot architecture |
| Result page | ❌ Not Built | Primary upcoming milestone |
| Ongoing monitoring | ❌ Not Built | Post-MVP/retention layer |

---

# 4. Landing Page

## Route

```text
/spend-guard
```

## Purpose

The landing page introduces Spend Guard and converts visitors into private beta users.

## Main Files

```text
client/src/pages/LandingPage.tsx

client/src/components/landing/
├── LandingNavbar.tsx
├── HeroSection.tsx
├── ProblemSection.tsx
├── SpendPreview.tsx
├── HowItWorksSection.tsx
├── RiskAlertPreview.tsx
├── AudienceSection.tsx
├── FinalCtaSection.tsx
└── LandingFooter.tsx
```

Primary styling:

```text
client/src/components/landing/
client/src/styles/
```

## Completed

- Public Spend Guard landing page
- Responsive design
- Hero section
- Problem positioning
- Spend preview
- Risk alert preview
- How-it-works section
- Audience section
- Final CTA
- Navigation
- Private beta CTA routing
- React Router SPA navigation

## Important Navigation Decision

The original CTA implementation used normal HTML anchors:

```tsx
<a href="/spend-guard/signup">
  Join Private Beta
</a>
```

This caused full browser document navigation and produced a visible white flash.

Internal funnel navigation now uses React Router:

```tsx
<Link to="/spend-guard/signup">
  Join Private Beta
</Link>
```

This keeps React mounted and provides smoother SPA navigation.

## Remaining

- Analytics
- Conversion event tracking
- Production SEO metadata
- Production deployment testing
- AEO/SEO content integration

---

# 5. Private Beta Signup

## Route

```text
/spend-guard/signup
```

## Main Files

```text
client/src/pages/spend-guard/SpendGuardSignupPage.tsx
client/src/spend-guard/auth.api.ts
client/src/api/client.ts
client/src/styles/spend-guard/funnel.css
```

## Current Fields

The signup form collects:

- Name
- Work email
- Company
- Monthly AWS spend range
- Password

## Current Registration Payload

The frontend now sends:

```json
{
  "email": "user@company.com",
  "password": "********",
  "name": "User Name",
  "company": "Company Name"
}
```

The frontend call uses:

```tsx
await registerSpendGuardUser({
  email: workEmail.trim(),
  password,
  name: name.trim(),
  company: company.trim(),
});
```

## Completed

- Signup interface
- Responsive styling
- Client validation
- Password validation
- Registration API
- Loading state
- Error state
- JWT response handling
- Signup → Setup navigation

## Session Storage

Access token:

```text
sessionStorage["cloudsightAccessToken"]
```

Beta lead metadata:

```text
sessionStorage["spendGuardBetaLead"]
```

Current beta metadata includes information such as:

- name
- email
- company
- AWS spend range
- user ID

## Remaining

- Complete organization provisioning transaction
- Verify OWNER membership creation
- Decide where AWS spend-range metadata should persist
- Add returning-user sign-in
- Harden production authentication

---

# 6. Authentication

## Main Backend Files

```text
server/src/controllers/auth.controller.ts
server/src/routes/auth.routes.ts
server/src/middleware/auth.middleware.ts
```

## Registration

Registration currently handles:

```text
Email validation
        ↓
Password validation
        ↓
Email normalization
        ↓
Existing-user check
        ↓
bcrypt password hashing
        ↓
Database creation
        ↓
JWT creation
```

The registration flow is being upgraded to:

```text
Registration Request
        ↓
Database Transaction
        ↓
User
        ↓
Organization
        ↓
OrganizationMember
        ↓
OWNER role
        ↓
JWT
```

## JWT

Current access token contains:

```json
{
  "userId": "...",
  "email": "..."
}
```

Current expiration:

```text
7 days
```

## Password Architecture

The newer database allows:

```prisma
passwordHash String?
```

This is intentional because CloudSight's newer authentication architecture supports federated authentication.

Possible providers include:

```text
LOCAL
GOOGLE
MICROSOFT
GITHUB
```

Local login must therefore verify that `passwordHash` exists before calling `bcrypt.compare()`.

## Current Authentication Limitation

The current Spend Guard implementation stores the JWT in:

```text
sessionStorage
```

This is acceptable during the current development phase but should not be treated as the final production session architecture.

## Production Direction

Longer-term authentication should return toward:

```text
Short-lived access token
        +
Persistent refresh session
        +
Refresh-token rotation
        +
HttpOnly cookie
```

---

# 7. Multi-Tenant Organization Architecture

CloudSight's newer database architecture is organization-scoped.

This is a major architectural change from the older user/global model.

## Core Relationship

```text
User
  ↓
OrganizationMember
  ↓
Organization
```

An organization owns resources such as:

```text
Organization
├── Budget
├── CloudAccount
├── AlertHistory
├── ReportNote
└── OrganizationMember
```

## User

Important fields include:

```text
id
email
passwordHash
name
authProvider
emailVerifiedAt
```

A user may have multiple organization memberships.

---

# 8. Organization

The current organization model contains:

```text
id
name
slug
createdAt
updatedAt
```

Organizations own:

```text
Budgets
Cloud Accounts
Alert History
Report Notes
Members
Invitations
```

## Organization ID

The current database model does not automatically generate the Organization ID.

Application code therefore generates it using:

```ts
randomUUID()
```

---

# 9. Organization Membership

`OrganizationMember` connects users with organizations.

Important fields:

```text
id
organizationId
userId
role
createdAt
updatedAt
```

## Available Roles

```text
OWNER
ADMIN
MEMBER
VIEWER
```

## New Signup Behavior

A new Spend Guard signup should create:

```text
User
  ↓
Organization
  ↓
OrganizationMember
      role = OWNER
```

This should happen inside a single Prisma transaction.

## Why This Matters

CloudSight is B2B software.

Resources should belong to the company/account boundary rather than directly to one employee.

This allows future functionality such as:

```text
Acme Inc.
│
├── Nathan — OWNER
├── Engineer A — ADMIN
├── Finance Lead — MEMBER
└── Executive — VIEWER
```

All of them can work against the same:

```text
AWS accounts
budgets
cost history
alerts
reports
forecasts
```

without duplicating company infrastructure for each user.

---

# 10. AWS Connection

## Setup Route

```text
/spend-guard/setup
```

## Setup Step

Step 1 collects the customer's AWS IAM Role ARN.

## Main Frontend Files

```text
client/src/pages/spend-guard/SpendGuardSetupPage.tsx
client/src/spend-guard/spend-guard.api.ts
```

## Main Backend Files

```text
server/src/routes/aws.routes.ts
server/src/controllers/aws.controller.ts
server/src/aws/clients/sts.client.ts
server/src/aws/services/aws-connection.service.ts
```

## Endpoint

```text
POST /aws/verify-connection
```

Through the Vite development proxy:

```text
POST /api/aws/verify-connection
```

## Intended AWS Architecture

```text
CloudSight AWS Identity
        ↓
AWS STS
        ↓
AssumeRole
        ↓
Customer CloudSight IAM Role
        ↓
Temporary AWS Credentials
        ↓
GetCallerIdentity
        ↓
Verified AWS Account
```

## Security Direction

CloudSight should not require customers to provide permanent AWS access keys.

The intended architecture uses:

```text
IAM Role
+
STS AssumeRole
+
Temporary credentials
```

---

# 11. AWS Mock Development Mode

Real AWS testing is temporarily unavailable.

Development therefore supports:

```env
SPEND_GUARD_MOCK_AWS=true
```

Mock verification allows the rest of the funnel to continue being built without requiring live AWS access.

## Mock Verification Returns

Information such as:

```text
connected
accountId
roleArn
assumedRoleArn
mocked
```

## Important Production Requirement

Production must never silently use mocked AWS verification.

Before deployment, mock behavior must be explicitly disabled.

---

# 12. AWS Connection Status

## Completed

- AWS STS dependency
- STS client
- AssumeRole service
- GetCallerIdentity verification
- AWS verification endpoint
- Frontend API integration
- Loading state
- Error state
- Successful mock connection
- AWS account ID returned
- AWS account shown during setup review

## Remaining

- Restore AWS account access
- Test real AWS credentials
- Test real AssumeRole
- Add ExternalId support
- Persist CloudAccount
- Add customer trust-policy instructions
- Validate Cost Explorer permissions
- Disable mock behavior in production

---

# 13. CloudAccount Model

The newer architecture includes organization-owned cloud accounts.

Important fields include:

```text
id
awsAccountId
accountName
organizationId
roleArn
externalId
isActive
connectionStatus
connectionError
lastVerifiedAt
disconnectedAt
lastCollectionAttemptAt
lastSuccessfulSyncAt
collectionError
```

Relationships:

```text
Organization
    ↓
CloudAccount
    ├── CostSnapshot
    └── ServiceCostSnapshot
```

This should become the primary AWS account boundary for Spend Guard.

---

# 14. Budget Setup

Budget setup is Step 2 of:

```text
/spend-guard/setup
```

The user enters their monthly AWS budget.

## Current UI

The UI exists and collects a budget value.

Currently the frontend still needs to complete the persistence workflow before moving to Step 3.

## New Budget Ownership Model

The newer database model is:

```text
Organization
    ↓
Budget
```

not:

```text
User
    ↓
Budget
```

## Important Unique Constraint

```prisma
@@unique([organizationId, year, month])
```

This means one organization has one monthly budget for a given month/year combination.

---

# 15. Budget API Architecture

The correct budget persistence flow is:

```text
POST /budget
      ↓
JWT authentication
      ↓
req.user.userId
      ↓
OrganizationMember lookup
      ↓
organizationId
      ↓
Budget upsert
```

The browser should **not** be trusted to choose an arbitrary `organizationId`.

The backend derives organization ownership from the authenticated user.

## Upsert Key

```text
organizationId
+
year
+
month
```

## Why Upsert

If the organization has no budget for the month:

```text
CREATE
```

If the organization already has a budget:

```text
UPDATE
```

This prevents duplicate monthly budgets.

---

# 16. Budget API Status

## Completed

- New organization-scoped Budget model confirmed
- Organization membership lookup architecture
- Authenticated budget controller
- Monthly budget upsert architecture
- Frontend budget API function drafted

## Remaining

- Finish organization provisioning
- Test authenticated POST `/budget`
- Connect setup Continue button
- Add loading state
- Add API error state
- Advance only after successful persistence
- Verify PostgreSQL record
- Add budget editing flow later

---

# 17. Analysis Step

Setup Step 3 currently acts as the analysis review screen.

It displays information such as:

```text
AWS account
IAM role
Monthly budget
Monitoring mode
```

Current action:

```text
Run first analysis
```

The analysis UI exists as a shell, but the analysis engine has not yet been connected.

---

# 18. First Analysis Architecture

The intended flow is:

```text
Run First Analysis
        ↓
Authenticate User
        ↓
Resolve Organization
        ↓
Resolve CloudAccount
        ↓
Load CostSnapshots
        ↓
Load ServiceCostSnapshots
        ↓
Load Monthly Budget
        ↓
Calculate Current Spend
        ↓
Project Month-End Spend
        ↓
Calculate Budget Variance
        ↓
Identify Top Cost Drivers
        ↓
Calculate Risk
        ↓
Return Spend Guard Result
```

---

# 19. First Analysis Output

The first-value result should eventually answer:

## Current Spend

```text
How much has the customer spent this month?
```

## Monthly Budget

```text
What budget did the organization configure?
```

## Projected Spend

```text
Where is spending currently heading by month-end?
```

## Budget Variance

Example:

```text
Budget:            $25,000
Projected spend:   $29,400
Projected overage:  $4,400
```

## Risk

Example:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

## Top Drivers

Example:

```text
EC2       +18%
RDS       +11%
S3         +6%
```

## Actionable Insight

Example:

```text
EC2 usage increased significantly during the last seven days
and is currently the largest contributor to projected budget risk.
```

---

# 20. New Cost Data Architecture

The newer CloudSight database uses:

```text
CloudAccount
    ↓
CostSnapshot
```

and:

```text
CloudAccount
    ↓
ServiceCostSnapshot
```

## CostSnapshot

Represents account-level cost snapshots.

Important fields:

```text
accountId
snapshotDate
totalCost
```

## ServiceCostSnapshot

Represents service-level costs.

Important fields:

```text
accountId
serviceName
snapshotDate
cost
```

This architecture should power Spend Guard analysis.

---

# 21. Legacy Architecture Transition

Older CloudSight server code still references legacy/global models such as:

```text
CostRecord
CloudService
BudgetSnapshot
```

Those models are no longer present in the newer database schema.

## Known Legacy Areas

Current server typechecking has exposed older references in areas including:

```text
costs.controller.ts
dashboard.controller.ts
reports.controller.ts
alert-history.repository.ts
budget-snapshot.repository.ts
budget-breach-detection.service.ts
forecast-risk-detection.service.ts
forecast.service.ts
reports/report.service.ts
```

## Migration Rule

Do not bring the old global models back simply to make TypeScript compile.

Instead migrate features toward:

```text
Organization
    ↓
CloudAccount
    ↓
CostSnapshot
    ↓
ServiceCostSnapshot
```

This preserves tenant isolation.

---

# 22. Current Database Direction

The database currently represents a newer architecture than some server code on this branch.

Prisma introspection confirmed models including:

```text
User
Organization
OrganizationMember
OrganizationInvitation
CloudAccount
CostSnapshot
ServiceCostSnapshot
Budget
AlertHistory
ReportNote
Session
SecurityAudit
PasswordResetToken
EmailVerificationToken
AuthIdentity
```

The application code should be aligned with this architecture rather than downgrading the database.

---

# 23. Prisma State

The local PostgreSQL database was introspected using:

```bash
set -a
source server/.env
set +a

npx prisma db pull \
  --schema=server/prisma/schema.prisma
```

Prisma Client was regenerated using:

```bash
npx prisma generate \
  --schema=server/prisma/schema.prisma
```

The generated Prisma Client now recognizes:

```text
Organization
OrganizationMember
organization-scoped Budget
CloudAccount
CostSnapshot
ServiceCostSnapshot
```

## Important Warning

Do not run:

```bash
prisma migrate reset
```

against the current development database as a shortcut for schema drift.

The database contains newer migration history that is not fully represented in this branch's migration directory.

---

# 24. Frontend API Structure

Current Spend Guard API code:

```text
client/src/spend-guard/
├── auth.api.ts
└── spend-guard.api.ts
```

Recommended direction:

```text
client/src/spend-guard/
├── auth.api.ts
├── spend-guard.api.ts
├── types.ts
└── storage.ts
```

Do not reorganize unnecessarily while the funnel is actively changing.

Prefer small cleanup steps after functionality stabilizes.

---

# 25. Frontend Page Structure

Current:

```text
client/src/pages/
├── LandingPage.tsx
└── spend-guard/
    ├── SpendGuardSignupPage.tsx
    └── SpendGuardSetupPage.tsx
```

Planned:

```text
client/src/pages/spend-guard/
├── SpendGuardSignupPage.tsx
├── SpendGuardSetupPage.tsx
└── SpendGuardResultPage.tsx
```

---

# 26. Backend Direction

Current backend functionality is spread across the existing CloudSight structure.

As Spend Guard grows, consider introducing:

```text
server/src/spend-guard/
├── services/
├── contracts/
└── types/
```

However, avoid moving existing working code simply for cosmetic organization during active MVP development.

The priority is:

```text
working architecture
>
clean abstractions
>
folder aesthetics
```

---

# 27. Development Environment

## Frontend

Typical development URL:

```text
http://localhost:5173
```

## Backend

Typical API URL:

```text
http://localhost:5001
```

## Vite Development Proxy

Frontend requests:

```text
/api/*
```

are proxied to the backend.

---

# 28. Common Development Commands

## Start Client

```bash
npm run dev --workspace=client
```

## Start Server

```bash
npm run dev --workspace=server
```

## Client Typecheck

```bash
npm run typecheck --workspace=client
```

## Client Production Build

```bash
npm run build:client
```

## Server Typecheck

```bash
npm run typecheck --workspace=server
```

## Prisma Generate

```bash
set -a
source server/.env
set +a

npx prisma generate \
  --schema=server/prisma/schema.prisma
```

## Prisma Validate

```bash
npx prisma validate \
  --schema=server/prisma/schema.prisma
```

---

# 29. Current Build Health

## Client

Current status:

```text
TypeScript typecheck: PASS
Production Vite build: PASS
```

Recent production build:

```text
2913 modules transformed
Build completed successfully
```

## Server

The newly migrated Spend Guard/authentication code is being aligned with the newer Prisma schema.

Full server typechecking currently exposes legacy CloudSight modules that still reference models removed from the newer architecture.

These should be migrated incrementally rather than reverting the schema.

---

# 30. Security Rules

## AWS

Do not store customer long-lived AWS credentials.

Use:

```text
STS AssumeRole
+
Temporary credentials
```

## Secrets

Never commit:

```text
server/.env
AWS access keys
AWS secret keys
JWT secrets
database passwords
Terraform backend secrets
```

## AWS Mock

Development may use:

```env
SPEND_GUARD_MOCK_AWS=true
```

Production must not.

## Organization IDs

Organization ownership should be resolved server-side from authenticated membership whenever possible.

Do not trust arbitrary client-supplied organization IDs for tenant-scoped operations.

---

# 31. Product Architecture Decisions

## Decision — Separate Spend Guard Wedge

**Date:** September 2026

Spend Guard is being built as a focused wedge inside CloudSight rather than abandoning the larger CloudSight platform.

### Reason

Reach customer value faster with a smaller product surface.

---

## Decision — Organization-Scoped Architecture

**Date:** September 2026

Budgets and cloud accounts belong to Organizations rather than individual Users.

### Reason

CloudSight is B2B software and needs proper multi-user tenant boundaries.

---

## Decision — React Router Internal Navigation

**Date:** September 2026

Internal funnel navigation uses React Router.

### Reason

Avoid full document reloads and visible white transition flashes.

---

## Decision — AWS AssumeRole

**Date:** September 2026

Customer AWS integration uses IAM roles and STS AssumeRole.

### Reason

Avoid collecting permanent AWS credentials and provide a more appropriate cross-account access model.

---

## Decision — Development AWS Mock

**Date:** September 2026

AWS verification can be mocked during development.

### Reason

Continue funnel development while live AWS account access is temporarily unavailable.

---

## Decision — First Value Before More UI

**Date:** September 2026

Prioritize completing the end-to-end customer value loop before additional landing-page polish.

### Reason

The funnel needs to produce a real useful result before expanding presentation work.

---

# 32. Funnel Roadmap

## Phase 1 — Acquisition

- [x] Spend Guard landing page
- [x] Hero CTA
- [x] Navbar CTA
- [x] Final CTA
- [x] React Router navigation
- [x] Private beta route
- [ ] Analytics events
- [ ] Production SEO
- [ ] Conversion tracking

---

## Phase 2 — Account Creation

- [x] Signup UI
- [x] Email/password registration
- [x] Name/company payload
- [x] Password hashing
- [x] JWT issuance
- [x] Frontend JWT storage
- [ ] Complete organization creation
- [ ] Complete OWNER membership
- [ ] End-to-end registration test
- [ ] Returning-user login flow
- [ ] Production session hardening

---

## Phase 3 — AWS Connection

- [x] IAM Role ARN input
- [x] STS dependency
- [x] STS client
- [x] AssumeRole service
- [x] GetCallerIdentity verification
- [x] Backend endpoint
- [x] Frontend API
- [x] Loading/error states
- [x] Mock AWS mode
- [ ] Live AWS verification
- [ ] ExternalId
- [ ] CloudAccount persistence
- [ ] Trust-policy onboarding instructions
- [ ] Cost Explorer permission validation

---

## Phase 4 — Budget

- [x] Budget UI
- [x] Organization-scoped Budget model
- [x] Organization lookup architecture
- [x] Budget upsert architecture
- [ ] Verify POST `/budget`
- [ ] Wire frontend Continue button
- [ ] Loading state
- [ ] Error state
- [ ] Database persistence test
- [ ] Budget retrieval
- [ ] Budget editing

---

## Phase 5 — First Value

- [x] Analysis review shell
- [ ] Analysis endpoint
- [ ] Resolve organization
- [ ] Resolve CloudAccount
- [ ] Load CostSnapshots
- [ ] Load ServiceCostSnapshots
- [ ] Current spend calculation
- [ ] Projected spend calculation
- [ ] Budget variance
- [ ] Risk classification
- [ ] Top cost drivers
- [ ] Actionable insight
- [ ] Spend Guard result page

---

## Phase 6 — Retention

- [ ] Persist monitoring configuration
- [ ] Scheduled AWS collection
- [ ] Risk alerts
- [ ] Email notifications
- [ ] Returning dashboard
- [ ] Historical risk timeline
- [ ] Alert history
- [ ] Budget history

---

# 33. Immediate Development Priorities

Work in this order:

```text
1. Finish atomic registration
       ↓
2. Verify User creation
       ↓
3. Verify Organization creation
       ↓
4. Verify OWNER membership
       ↓
5. Test authenticated POST /budget
       ↓
6. Wire budget Continue button
       ↓
7. Persist verified CloudAccount
       ↓
8. Build analysis endpoint
       ↓
9. Build Spend Guard result
       ↓
10. Restore live AWS testing
```

Avoid adding unrelated product functionality until this path works.

---

# 34. Next Milestone

The next meaningful milestone is:

> A brand-new user can sign up, receive an organization, connect an AWS account, save a monthly budget, and reach the first-analysis step with all configuration persisted in PostgreSQL.

After that:

> Run First Analysis should produce the first real Spend Guard result.

---

# 35. Definition of Spend Guard MVP

Spend Guard reaches functional MVP when this works:

```text
Visitor
  ↓
Landing Page
  ↓
Private Beta Signup
  ↓
User Created
  ↓
Organization Created
  ↓
OWNER Membership Created
  ↓
AWS Account Connected
  ↓
CloudAccount Persisted
  ↓
Monthly Budget Persisted
  ↓
AWS Cost Data Collected
  ↓
Risk Analysis Executed
  ↓
Useful Result Displayed
```

The first result should clearly communicate:

```text
Current AWS spend
Projected month-end spend
Monthly budget
Projected overage/remaining budget
Risk level
Top cost drivers
Primary actionable insight
```

That is the core Spend Guard customer value loop.

---

# 36. Documentation Maintenance Rule

Update this document whenever one of the following occurs:

- A funnel stage becomes functional.
- A route changes.
- A major API endpoint is added.
- Database ownership changes.
- Authentication architecture changes.
- AWS architecture changes.
- A major technical decision is made.
- A roadmap item is completed.
- A new blocker appears.
- The MVP definition changes.

Use:

```text
✅ Complete
🟡 In Progress
⏸ Blocked
❌ Not Complete
```

for high-level status tracking.

This file should remain the primary engineering reference for the current Spend Guard implementation.