# CloudSight Authentication Current State

**Version:** `1.7.0-alpha`

**Branch:** `feature/auth-refresh-token-persistence`

**Last Updated:** 2026-08-24

---

# Current Development Checkpoint

This file is the authoritative source of truth for the current CloudSight authentication working tree.

Phase 2.5 — Production Authentication Hardening is complete.

Phase 3.1 — Google authentication, including PostgreSQL verification and
browser/HTTP verification, is complete through Phase 3.1.11.3C.
Phase 3.2.1 configuration, Phase 3.2.2 Entra OIDC provider-boundary work,
Phase 3.2.3 generic routing, and the Microsoft frontend provider-control
milestone are complete.

Existing authentication work may remain uncommitted.

Do not reset, revert, stash, clean, overwrite, discard, or commit existing changes unless explicitly instructed.

The next product-development phase is:

**Phase 5.0 — Organization / Multi-Tenancy Architecture Audit**

The completed milestone is:

**Phase 3.3.6 — GitHub security/regression closure — COMPLETE**

Phase 3.2.0 planning, 3.2.1 configuration/registration, 3.2.2 provider boundary,
3.2.3 generic routing, and the real frontend Microsoft control are complete.
Phase 3.3.0 planning, 3.3.1 configuration/provider registration, 3.3.2
provider-boundary implementation, and 3.3.3 generic routing/federated
integration, 3.3.4 GitHub frontend sign-in control, and 3.3.5 deterministic
GitHub verification are complete. Phase 3.3.6 was reopened after post-closure
review found four P1 defects and one P2 defect; those findings were remediated.
A second post-remediation review then found five additional P1 findings and
two P2 findings. All seven were independently confirmed and remediated, and
the complete mandatory regression matrix passed on the final code. Core Google,
Microsoft, and GitHub authentication is closed. Phase 3.4 and Phase 3.5 are now
deferred until a concrete customer or enterprise requirement justifies them.

Do not install OAuth, OIDC, SAML, or provider-specific packages and do not change authentication behavior until the architecture audit and migration plan are complete.

---

# Current Phase

## Phase 3 — Federated Authentication

**Status:** Phase 3.1 Google authentication COMPLETE; Phase 3.2.0–3.2.6 COMPLETE; Phase 3.3.0–3.3.6 COMPLETE.

Planned roadmap:

1. Phase 3.0 — Federated Authentication Architecture + Data Model Audit
2. Phase 3.1 — Google OAuth
3. Phase 3.2 — Microsoft Entra ID
4. Phase 3.3 — GitHub OAuth
5. Phase 3.6 — Account Linking / Provider Collision Handling
6. Phase 3.7 — Federated Authentication Security Audit + Regression Verification
7. Phase 5 — Authorization / Multi-Tenancy (Organizations, RBAC, invitations) — NEXT PRODUCT PRIORITY
8. Phase 3.4 — Generic OpenID Connect — DEFERRED UNTIL CUSTOMER REQUIREMENT
9. Phase 3.5 — SAML 2.0 — DEFERRED UNTIL ENTERPRISE REQUIREMENT

---

# Immediate Milestone

## Historical Phase 3.0 — Federated Authentication Architecture + Data Model Audit

**Status:** COMPLETE and superseded by the implemented Phase 3.1 Google work

This milestone is architecture and planning only.

Do not edit authentication behavior until the audit and migration plan are complete.

Audit:

1. Current User/Prisma schema and uniqueness assumptions.
2. Password-backed account assumptions.
3. Login, session issuance, and refresh pipeline.
4. Controller → Service → Repository boundaries.
5. Existing audit-event model.
6. Client `AuthProvider` and API assumptions.
7. Provider identity storage requirements.
8. Existing-account linking rules.
9. Email collision and account-takeover risks.
10. OAuth state, PKCE, and nonce requirements.
11. Callback and error translation boundaries.
12. Logout and session-revocation behavior for federated sessions.

The Phase 3.0 deliverable must define:

* The smallest safe federated-auth architecture.
* Provider identity data model.
* User/provider relationship model.
* Account-linking rules.
* Provider collision behavior.
* Callback boundaries.
* Session issuance boundaries.
* Error translation boundaries.
* Security requirements.
* Atomic implementation plan.

Stop after the architecture audit and migration plan.

Do not begin provider implementation until that plan has been reviewed.

---

# Phase 2.5 — Production Authentication Hardening

**Status:** COMPLETE

Completed hardening:

* ✅ Database-backed session enforcement
* ✅ Secure HttpOnly refresh-token cookies
* ✅ CSRF protection engineering through Step 7
* ✅ Typed Domain Errors
* ✅ Authentication Rate Limiting
* ✅ Email delivery integration / safe token transport
* ✅ Verification-token HTTP exposure removed

Do not reopen Phase 2.5 unless a demonstrated regression requires it.

---

# Phase 2.5 Final Rate-Limit Matrix

| Endpoint / Scope    |            Limit | Key                           |
| ------------------- | ---------------: | ----------------------------- |
| Global              | 300 / 15 minutes | IP                            |
| Register            |   5 / 15 minutes | IP                            |
| Login               |  10 / 10 minutes | IP + normalized-email-hash/IP |
| Forgot Password     |   5 / 15 minutes | IP + normalized-email-hash/IP |
| Resend Verification |   3 / 15 minutes | IP                            |
| Verify Email        |  10 / 15 minutes | IP                            |
| Reset Password      |  10 / 15 minutes | IP                            |
| Refresh             | 120 / 15 minutes | IP                            |
| Change Password     |   5 / 15 minutes | Authenticated-user/IP         |

Rate limiting uses centralized generic `429` responses, IPv6-safe key handling, no raw credential limiter keys, and preserves enumeration/oracle resistance.

Refresh single-flight, CSRF, trusted-origin validation, and Typed Domain Errors remain intact.

---

# Phase 2.5 Closure Verification

Passed:

```text
npm run typecheck
npm run build
git diff --check
```

No Phase 2.5 implementation defects remained after the final audit.

---

# Deferred Deployment / QA Hardening

The following work remains outside the completed Phase 2.5 implementation:

* Production trusted-proxy topology must be documented before forwarded client IPs are trusted.
* Replace the default per-process in-memory rate-limit store with a distributed store before multi-instance enforcement.
* Browser E2E verification was deferred at this historical checkpoint and is now complete in Phase 3.1.11.3C.

---

# Historical Phase 2 Product / UI Work

* ⬜ Change-password frontend / remaining Security Center integration
* ✅ Email-verification frontend (completed in Phase 3.1.11.3C)
* ✅ Resend-verification frontend (completed in Phase 3.1.11.3C)
* ⬜ Production email provider and templates
* ⬜ Email retry handling
* ⬜ Email delivery failure handling
* ⬜ Email delivery observability

These items do not reopen the completed Phase 2.5 backend production-hardening milestone.

---

# Authentication Architecture

```text
Browser
↓
React Router
↓
ProtectedRoute
↓
AuthProvider
↓
React Query
↓
Shared API Client
↓
Express Route
↓
Authentication / Validation Middleware
↓
Controller
↓
Service
↓
Repository
↓
Prisma ORM
↓
PostgreSQL
```

---

# Architecture Rules

These rules remain mandatory:

* Controllers handle HTTP concerns.
* Services contain business logic.
* Repositories are the only layer allowed to use Prisma.
* Never access Prisma directly from controllers or services.
* Authentication state lives in `AuthProvider`.
* React Query owns server state where appropriate.
* Preserve strict TypeScript safety.
* Preserve database-backed sessions.
* Preserve refresh-token rotation.
* Preserve refresh-token hashing.
* Preserve session revocation.
* Preserve access-token JWT behavior unless a security milestone explicitly requires changing it.
* Raw security tokens must never be persisted.
* Build one authentication milestone at a time.
* Do not refactor unrelated authentication code.
* Run static and live verification appropriate to every security milestone.
* Preserve enumeration resistance.

---

# Security Invariants

Phase 3 must preserve all existing authentication security guarantees.

## Refresh Tokens

Refresh tokens follow:

```text
Secure Random Token
↓
HttpOnly Cookie
↓
SHA-256
↓
Database Session Hash
```

The raw refresh token is:

* Not persisted in PostgreSQL.
* Not returned in API JSON.
* Not stored in `localStorage`.
* Not stored in `sessionStorage`.
* Not accessible through `document.cookie`.
* Only transported through the HttpOnly refresh cookie.

Refresh-token rotation must remain intact.

The backing database session remains authoritative.

---

# Refresh Token Rotation

```text
Current Refresh Token
↓
Validate Hash Against Session
↓
Generate New Random Refresh Token
↓
Hash New Token
↓
Replace Existing Session Hash
↓
Issue New Access Token
↓
Return New Refresh Token Through Set-Cookie
```

Normal rotation must not improperly extend the backing database session.

Old refresh tokens must remain invalid after rotation.

---

# Access Tokens

Access tokens remain JWT bearer tokens.

Current access-token validation:

```text
Access JWT
↓
JWT Signature + Expiration Validation
↓
sessionId
↓
Database Session Validation
↓
Protected Request
```

Current JWT payload includes:

```text
userId
email
sessionId
iat
exp
```

Phase 3 must not weaken the database-backed session validation model.

---

# Password Security

```text
Password
↓
BCrypt
↓
Hash
↓
Database
```

Raw passwords are never stored.

Federated authentication must account for users who may not have a traditional password-backed authentication path.

That assumption must be audited during Phase 3.0 before changing the User model.

---

# Verification Tokens

```text
Secure Random Token
↓
SHA-256
↓
Hash
↓
Database
```

Raw verification tokens remain internal to the email-delivery path.

They must never be persisted or exposed through public HTTP responses.

---

# Password Reset Tokens

```text
Secure Random Token
↓
SHA-256
↓
Hash
↓
Database
```

Reset tokens remain:

* Expiring
* Single use
* Replay protected
* Hash-only persisted

---

# CSRF Security Boundary

The browser automatically attaches the HttpOnly refresh cookie to matching requests.

Cookie-authenticated state-changing requests therefore require explicit CSRF protection.

CORS alone is not a complete CSRF defense.

Existing protections must remain intact during Phase 3:

* Trusted-origin enforcement
* CSRF enforcement
* Login/pre-auth CSRF protection
* Refresh-bound CSRF rotation
* Logout protection
* Logout-all protection
* Session-revocation protection
* Stale refresh invalidation
* Refresh single-flight behavior

A refresh that began before logout or current-session invalidation must not restore authentication after the invalidation boundary.

---

# Refresh Cookie Configuration

## Development

```text
httpOnly: true
secure: false
sameSite: lax
path: /auth
maxAge: bounded by backing session expiration
```

## Production

Production configuration must maintain:

```text
httpOnly: true
secure: true
path: /auth
maxAge: bounded by backing session expiration
```

`sameSite` must match the actual production deployment topology.

Prefer `lax` when frontend and API deployments remain same-site.

Use `none` only when genuinely required for cross-site cookie transport.

When using:

```text
sameSite: none
```

the cookie must also use:

```text
secure: true
```

Do not unnecessarily configure a broad cookie domain.

---

# Credentialed CORS

Credentialed CORS remains required for refresh-cookie transport.

Development frontend origin:

```text
http://localhost:5174
```

Expected behavior:

```http
Access-Control-Allow-Origin: http://localhost:5174
Access-Control-Allow-Credentials: true
```

Security requirements:

* No wildcard credentialed origin.
* Configured-origin requests may succeed.
* Hostile origins must not be reflected.
* Unauthorized origins must remain rejected.

---

# Session Enforcement

Protected authenticated requests validate:

1. Access-token JWT validity.
2. The backing database session.

Authentication middleware rejects:

* Missing sessions.
* Revoked sessions.
* Expired sessions.
* Invalid access tokens.

Session revocation therefore takes effect immediately rather than waiting for the access JWT to expire.

---

# Login Architecture

```text
POST /auth/login
↓
Validate Credentials
↓
Generate Access Token
↓
Generate Raw Refresh Token
↓
SHA-256 Hash Refresh Token
↓
Persist Refresh-Token Hash in Database Session
↓
Set Raw Refresh Token as HttpOnly Cookie
↓
Return Access Token + Safe User Data
```

The raw refresh token is not returned in JSON.

Phase 3 federated authentication should ultimately converge into the existing secure session issuance model rather than creating a parallel weaker session architecture.

The exact integration boundary must be defined during Phase 3.0.

---

# Refresh Architecture

```text
POST /auth/refresh
↓
Browser Automatically Sends HttpOnly Cookie
↓
Read Refresh Token from Cookie
↓
SHA-256 Hash Token
↓
Locate Active Database Session
↓
Validate Session
↓
Generate Rotated Refresh Token
↓
Hash Rotated Token
↓
Replace Stored Hash
↓
Generate New Access Token
↓
Set Rotated Refresh Token as HttpOnly Cookie
↓
Return New Access Token
```

The refresh request does not require a raw refresh token in JSON.

The refresh response does not return a raw refresh token in JSON.

---

# Logout Architecture

```text
POST /auth/logout
↓
Read Refresh Cookie
↓
Locate Session
↓
Revoke Session
↓
Clear Refresh Cookie
↓
Clear Frontend Authentication State
```

Federated authentication must preserve local application session revocation semantics.

Provider logout behavior, if required, must be evaluated separately during Phase 3 architecture work.

---

# Logout All

```text
POST /auth/logout-all
↓
Revoke All Sessions
↓
Clear Current Refresh Cookie
↓
Clear Current Frontend Authentication State
```

Revoked sessions cannot subsequently refresh.

---

# Individual Session Revocation

Revoking another session:

* Revokes the target session.
* Preserves the current session.
* Preserves the current refresh cookie.
* Prevents the revoked session from refreshing.

Revoking the current session:

* Revokes the current database session.
* Causes protected requests to fail.
* Prevents refresh.
* Clears frontend authentication state.
* Returns the application to an unauthenticated state.

---

# Current Authentication API

## Public / Cookie-Bootstrap Endpoints

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
```

## Authentication / Session Endpoints

```http
GET /auth/me
GET /auth/audit
GET /auth/sessions
POST /auth/change-password
POST /auth/resend-verification
POST /auth/logout
POST /auth/logout-all
DELETE /auth/sessions/:sessionId
```

Authorization requirements remain determined by the active route configuration.

Phase 3.0 must determine the smallest route additions required for federated authentication.

Do not add routes until the audit is complete.

---

# Email Delivery

**Status:** Provider abstraction complete.

Implemented:

* `EmailService`
* `EmailProvider`
* `DevelopmentEmailProvider`
* Verification-email delivery path
* Password-reset-email delivery path
* `sendVerificationEmail()`
* `sendPasswordResetEmail()`

Raw verification/reset tokens may be passed internally to the email layer when required for delivery.

Raw verification/reset tokens are never persisted.

Only their hashes are persisted.

Remaining production work:

* Real production email provider
* Production templates
* Retry strategy
* Delivery-failure handling
* Delivery observability

---

# Authentication Roadmap

## Phase 1 — Authentication Foundation

**Status:** COMPLETE

Completed:

* ✅ User registration
* ✅ Email/password login
* ✅ BCrypt password hashing
* ✅ JWT authentication
* ✅ Refresh tokens
* ✅ Refresh-token rotation
* ✅ Persistent sessions
* ✅ Database-backed sessions
* ✅ Session revocation
* ✅ Logout
* ✅ Logout-all
* ✅ Protected routes
* ✅ React authentication
* ✅ `AuthProvider`
* ✅ `ProtectedRoute`
* ✅ Automatic session restoration
* ✅ Security Dashboard
* ✅ Session Management UI
* ✅ Security audit logging
* ✅ Device detection
* ✅ Browser detection
* ✅ Operating-system detection
* ✅ Current-device detection
* ✅ Security metrics
* ✅ Security timeline

---

## Phase 2 — Account Recovery and Password Management

**Status:** SUBSTANTIALLY COMPLETE

### Phase 2.1 — Refresh Token Persistence

**Status:** COMPLETE

Completed:

* ✅ Refresh-token persistence
* ✅ Refresh-token rotation
* ✅ Refresh-token validation
* ✅ Session-aware JWT payloads
* ✅ Refresh endpoint
* ✅ Refresh service
* ✅ Session repository
* ✅ Database-backed session records

### Phase 2.2 — Password Recovery

**Status:** COMPLETE

Completed:

* ✅ `PasswordResetToken` model
* ✅ Prisma migration
* ✅ `PasswordResetRepository`
* ✅ `PasswordResetService`
* ✅ Secure random reset-token generation
* ✅ SHA-256 token hashing
* ✅ Token expiration
* ✅ Single-use tokens
* ✅ Expired-token cleanup support
* ✅ Forgot-password endpoint
* ✅ Reset-password endpoint
* ✅ Password hashing
* ✅ Password update
* ✅ Revoke every active session after password reset
* ✅ `PASSWORD_RESET` audit event
* ✅ Account-enumeration resistance

### Phase 2.3 — Password Management

**Status:** BACKEND COMPLETE

Completed:

* ✅ Generic Zod validation middleware
* ✅ Authentication request validators
* ✅ Shared password policy
* ✅ Validation before controllers
* ✅ Consistent validation responses
* ✅ Authenticated-user password lookup
* ✅ Password hash update
* ✅ Current-password verification
* ✅ Password-reuse prevention
* ✅ Optional other-session revocation
* ✅ `PASSWORD_CHANGED` audit event
* ✅ `POST /auth/change-password`

Remaining at the historical checkpoint; change-password and Security Center
coverage were subsequently implemented and verified during Phase 3.1 work.

### Phase 2.4 — Email Verification

**Status:** COMPLETE through the Phase 3.1 browser verification checkpoint

Completed:

* ✅ `EmailVerificationToken` model
* ✅ `emailVerifiedAt`
* ✅ Prisma migration
* ✅ `EMAIL_VERIFIED` audit event
* ✅ `EmailVerificationRepository`
* ✅ Secure random token generation
* ✅ SHA-256 hashing
* ✅ Expiration
* ✅ Single-use behavior
* ✅ Replay protection
* ✅ `POST /auth/verify-email`
* ✅ `POST /auth/resend-verification`
* ✅ Email-delivery abstraction
* ✅ Removal of development verification-token HTTP exposure

Production email provider/templates remain deployment work; verification and
resend frontend behavior are complete and browser-verified.

### Phase 2.5 — Production Authentication Hardening

**Status:** COMPLETE

Completed:

* ✅ Database-backed access-session validation
* ✅ Middleware session enforcement
* ✅ Immediate revoked-session rejection
* ✅ Immediate expired-session rejection
* ✅ Resend verification endpoint
* ✅ Email-delivery integration
* ✅ Development verification-token response removed
* ✅ Secure HttpOnly refresh-token cookies
* ✅ Credentialed CORS
* ✅ Browser session restoration
* ✅ Cookie-aware logout and session revocation
* ✅ CSRF protection
* ✅ Typed Domain Errors
* ✅ Authentication Rate Limiting

---

# Phase 3 — Federated Authentication

**Status:** Phase 3.1 Google COMPLETE; Phase 3.2 Microsoft COMPLETE; Phase 3.3 GitHub COMPLETE. Core multi-provider authentication is now closed. The next product priority is Phase 5 — Authorization / Multi-Tenancy.

Roadmap:

### Phase 3.0

Federated Authentication Architecture + Data Model Audit

### Phase 3.1

Google OAuth

### Phase 3.2

Microsoft Entra ID

### Phase 3.3

GitHub OAuth

### Phase 3.4

Generic OpenID Connect — DEFERRED until a concrete customer/provider requirement exists.

### Phase 3.5

SAML 2.0 — DEFERRED until enterprise demand justifies implementation.

### Phase 3.6

Account Linking / Provider Collision Handling — retain as an authentication follow-up before self-service identity linking is exposed.

### Phase 3.7

Federated Authentication Security Audit + Regression Verification — retain as the final federation closure milestone after any future 3.4–3.6 work.

---

# Phase 4 — Advanced Authentication Security

**Status:** NOT STARTED

Planned:

* MFA
* Backup codes
* Trusted devices
* Passkeys
* Hardware security keys
* Refresh-token reuse detection

---

# Phase 5 — Authorization / Multi-Tenancy

**Status:** NEXT PRODUCT PRIORITY

This phase follows the completed Google, Microsoft, and GitHub authentication work.
The objective is to move CloudSight from individual-user authentication into a B2B
workspace model where users belong to organizations and access is enforced through
organization-scoped roles and permissions.

Planned:

* Organizations / workspaces
* Organization membership model
* Multi-tenant authorization boundaries
* RBAC
* Permission enforcement
* Team invitations
* Active organization selection / context
* Organization-scoped audit events
* Tenant-isolation regression tests

## Phase 5.0 — Organization / Multi-Tenancy Architecture Audit

**Status:** NEXT

Start read-only. Audit before implementation:

1. Current User relationships and ownership assumptions.
2. Existing cloud-resource ownership and whether records are user-scoped or globally scoped.
3. API routes and services that will require organization context.
4. Current authorization middleware and protected-route assumptions.
5. Proposed Organization and Membership models.
6. Role model and minimum permissions required for the B2B MVP.
7. Invitation lifecycle and security requirements.
8. Tenant-boundary enforcement at repository/service layers.
9. Migration strategy for existing users and data.
10. Organization-aware audit logging.
11. Frontend organization context and onboarding flow.
12. Deterministic tenant-isolation test matrix.

Required output:

* Current ownership/authorization architecture map.
* Smallest safe Organization + Membership data model.
* MVP RBAC policy.
* Existing-user migration strategy.
* Tenant-isolation rules.
* Invitation security design.
* Backend/frontend integration boundaries.
* Atomic implementation sequence.

Stop after the read-only architecture audit and implementation plan. Do not modify
the schema or authorization behavior until the Phase 5.0 plan has been reviewed.

---

# Phase 6 — Compliance / Security Operations

**Status:** NOT STARTED

Planned:

* Compliance controls
* SIEM export
* Security policies
* Advanced audit logging

---

# Current Authentication Layer Progress

```text
Phase 1 — Authentication Foundation          COMPLETE
Phase 2 — Core backend                       SUBSTANTIALLY COMPLETE
Phase 2.5 — Production hardening             COMPLETE
Phase 3.1 — Google authentication            COMPLETE
Phase 3.2 — Microsoft Entra ID               COMPLETE
Phase 3.3 — GitHub OAuth                      COMPLETE
Phase 4 — Advanced authentication security   DEFERRED
Phase 5 — Authorization / multi-tenancy      NEXT PRODUCT PRIORITY
Phase 6 — Compliance / security operations   NOT STARTED
```

Planning estimate for the full planned authentication platform:

```text
~60% COMPLETE
```

This is a roadmap estimate, not a repository-derived completion metric.

---

# Phase 3.0 Audit Requirements

Before editing code, inspect the actual repository.

## 1. User / Prisma Data Model

Determine:

* Current `User` model structure.
* Email uniqueness constraints.
* Whether password/hash fields are mandatory.
* Whether authentication assumes every user has a password.
* Existing relationships that federated identities could affect.
* Migration risks.
* Whether provider identities require a separate model.

Do not modify the schema during the audit.

---

## 2. Password-Backed Account Assumptions

Trace all logic that assumes:

```text
User → Email + Password
```

Identify:

* Registration assumptions.
* Login assumptions.
* Password-reset assumptions.
* Change-password assumptions.
* Email-verification assumptions.
* Client UI assumptions.
* Service assumptions.
* Repository assumptions.

Determine how a federated-only user should behave without weakening existing password authentication.

---

## 3. Session Issuance Pipeline

Trace:

```text
Successful Authentication
↓
Access Token
↓
Refresh Token
↓
Refresh Hash
↓
Database Session
↓
HttpOnly Cookie
↓
Authenticated Client State
```

Determine where federated authentication should enter this pipeline.

Prefer reuse of the existing session issuance architecture rather than creating a parallel provider-specific session system.

Do not implement this during Phase 3.0.

---

## 4. Controller → Service → Repository Boundaries

Audit the existing authentication boundaries.

Preserve:

```text
Controller
↓
Service
↓
Repository
↓
Prisma
```

Provider-specific integrations must not cause direct Prisma access from controllers or services.

Determine where provider orchestration belongs.

---

## 5. Audit Events

Inspect the existing authentication audit-event model.

Determine which new events may eventually be required, such as:

```text
FEDERATED_LOGIN
FEDERATED_ACCOUNT_LINKED
FEDERATED_ACCOUNT_UNLINKED
FEDERATED_LOGIN_FAILED
```

These are architecture candidates only.

Do not add them until the existing audit model has been inspected and the migration plan is approved.

---

## 6. Client Authentication Assumptions

Audit:

* `AuthProvider`
* Shared API client
* Login UI
* Registration UI
* Protected routes
* Session restoration
* Logout
* Authentication error handling
* Redirect behavior

Determine the smallest client changes required to support federated authentication while preserving existing session restoration.

---

## 7. Provider Identity Storage

Determine the minimum provider identity data required.

Candidate conceptual model:

```text
User
↓
FederatedIdentity
├── provider
├── providerSubject
├── providerEmail
├── createdAt
└── updatedAt
```

This is not an approved schema.

The actual model must be derived from the existing Prisma schema and provider requirements during Phase 3.0.

Provider subject identifiers must be treated as authoritative provider identities.

Do not assume email alone is a safe provider identity key.

---

## 8. Existing-Account Linking

Define safe behavior when a provider login returns an email matching an existing CloudSight account.

Do not automatically assume:

```text
matching email = safe account link
```

The audit must explicitly evaluate:

* Provider email verification guarantees.
* Existing account ownership.
* Account-takeover risk.
* Explicit linking requirements.
* Reauthentication requirements.
* Provider collision handling.

---

## 9. Email Collision / Account-Takeover Risk

Evaluate:

```text
Existing CloudSight account
+
Federated provider identity
+
Matching or conflicting email
```

Determine safe behavior for:

* Existing password account + Google identity.
* Existing password account + Microsoft identity.
* Existing password account + GitHub identity.
* Multiple providers with the same email.
* Provider email changes.
* Missing provider email.
* Unverified provider email.
* Provider identity already linked to another user.

Enumeration resistance must remain intact.

---

## 10. OAuth State / PKCE / Nonce

Determine requirements for:

* OAuth `state`
* PKCE
* OIDC `nonce`
* Callback validation
* State expiration
* State replay prevention
* Secure state persistence
* Redirect validation

Do not implement shortcuts around provider security requirements.

---

## 11. Callback Boundary

Define:

```text
Provider
↓
Callback Route
↓
Provider Response Validation
↓
Provider Identity Resolution
↓
CloudSight User Resolution
↓
Account-Linking Policy
↓
Existing Session Issuance Pipeline
↓
HttpOnly Refresh Cookie
↓
Client Authentication State
```

Determine where Typed Domain Errors translate into HTTP responses.

Provider errors, domain errors, infrastructure errors, and validation errors must remain distinct where appropriate.

Security-sensitive responses must remain generic where required.

---

## 12. Federated Logout / Session Revocation

Determine the distinction between:

```text
CloudSight session logout
```

and:

```text
Identity-provider logout
```

CloudSight session revocation must remain authoritative for CloudSight access.

Do not make application logout dependent on successful remote provider logout.

Determine whether provider logout is required at all before implementing it.

---

# Phase 3.0 Required Output

The Phase 3.0 audit must produce:

1. Current authentication architecture map.
2. Current User/Prisma model analysis.
3. Password-account assumption analysis.
4. Federated provider identity model recommendation.
5. Account-linking policy.
6. Provider collision policy.
7. OAuth/OIDC security requirements.
8. Callback architecture.
9. Session issuance integration boundary.
10. Error translation strategy.
11. Audit-event requirements.
12. Client integration requirements.
13. Database migration requirements.
14. Security risks.
15. Atomic implementation sequence.

Do not modify files before this analysis is complete.

---

# Phase 3.0 Constraints

## Preserve

* HttpOnly refresh-token cookies
* Refresh-token hashing
* Refresh-token rotation
* Database-backed sessions
* Session revocation
* CSRF protections
* Trusted-origin validation
* Access-token JWT behavior
* Typed Domain Errors
* Authentication rate limiting
* Controller → Service → Repository architecture
* Prisma repository-only access
* Strict TypeScript safety
* Enumeration resistance
* Existing uncommitted work

## Do Not

* Reset
* Revert
* Stash
* Clean
* Discard
* Overwrite existing work
* Commit
* Install OAuth packages yet
* Install OIDC packages yet
* Install SAML packages yet
* Modify authentication behavior yet
* Begin Google OAuth implementation yet
* Begin Microsoft Entra implementation yet
* Begin GitHub OAuth implementation yet
* Refactor unrelated authentication code
* Weaken security-sensitive generic responses
* Expose raw security tokens
* Create a parallel weaker session architecture

---

# Git State

Current branch:

```text
feature/auth-refresh-token-persistence
```

Version:

```text
1.7.0-alpha
```

Latest previously recorded HEAD during refresh-cookie verification:

```text
6e7a94a feat(auth): complete password management and email verification backend
```

Do not assume uncommitted authentication changes are represented by that HEAD.

Inspect the current working tree before making any future implementation changes.

Preserve the entire existing working tree.

---

# Immediate Next Action

```text
Read AUTHENTICATION_CURRENT_STATE.md
↓
Inspect current git status and working tree without modifying it
↓
Begin the later frontend Microsoft provider-control milestone
↓
Preserve the completed Entra provider boundary and audit generic callback seams
↓
Audit client AuthProvider / API assumptions
↓
Define provider identity requirements
↓
Analyze account linking
↓
Analyze provider/email collision risks
↓
Define OAuth state / PKCE / nonce requirements
↓
Define callback and error boundaries
↓
Define federated session/logout behavior
↓
Produce smallest safe Entra ID integration architecture
↓
Produce atomic implementation plan
↓
STOP
```

Do not begin frontend provider controls or later providers until the completed backend routing/security evidence is preserved.

---

# Resume Prompt

```text
We are continuing development on CloudSight.

Read AUTHENTICATION_CURRENT_STATE.md first and treat it as the authoritative source of truth.

Current branch:
feature/auth-refresh-token-persistence

Version:
1.7.0-alpha

Phase 2.5 — Production Authentication Hardening is COMPLETE.

Do not reopen Phase 2.5 unless a demonstrated regression requires it.

Next phase:
Phase 3.2.2 — Microsoft Entra ID OIDC provider boundary

Immediate milestone:
Phase 3.2.2 — Microsoft Entra ID OIDC provider boundary

Start read-only.

Do not install OAuth/OIDC/SAML packages and do not edit authentication behavior until the architecture audit and migration plan are complete.

Audit:

1. Current User/Prisma schema and uniqueness assumptions.
2. Password-backed account assumptions.
3. Login/session issuance and refresh pipeline.
4. Controller → Service → Repository boundaries.
5. Existing audit-event model.
6. Client AuthProvider/API assumptions.
7. Provider identity storage requirements.
8. Existing-account linking rules.
9. Email collision and account-takeover risks.
10. OAuth state/PKCE/nonce requirements.
11. Callback and error translation boundaries.
12. Logout/session-revocation behavior for federated sessions.

Produce:

1. Current architecture findings.
2. Smallest safe provider-identity architecture.
3. Account-linking and collision policy.
4. Required data-model changes.
5. OAuth/OIDC security requirements.
6. Session issuance integration design.
7. Error translation design.
8. Client integration requirements.
9. Security risks.
10. Atomic implementation plan.

Preserve:

- HttpOnly refresh-token cookies
- Refresh-token hashing
- Refresh-token rotation
- Database-backed sessions
- Session revocation
- CSRF protections
- Trusted-origin validation
- Access-token JWT behavior
- Typed Domain Errors
- Authentication rate limiting
- Controller → Service → Repository → Prisma boundaries
- Strict TypeScript safety
- Enumeration resistance
- Entire existing uncommitted working tree

Do not:

- Reset
- Revert
- Stash
- Clean
- Discard
- Overwrite
- Commit
- Install additional provider packages without an approved dependency review
- Implement Google OAuth
- Implement Microsoft Entra ID
- Implement GitHub OAuth
- Implement generic OIDC
- Implement SAML
- Refactor unrelated authentication code
- Weaken security-sensitive responses
- Expose raw security tokens

Stop after the Phase 3.2.2 provider-boundary implementation and focused validation pass.

Do not edit files until the audit and plan are complete.
```

**Historical stopping point:** Phase 3.2.3 generic OAuth routing and transaction integration was complete before the later frontend and closure milestones. Superseded by the authoritative Phase 3.2.6 closure below.

## PostgreSQL authentication verification (Phases 3.1.11.2C0–C6)

Verified against the disposable `cloudsight_test` PostgreSQL database using the guarded test-database runner:

- C0: isolated PostgreSQL service, database-name/host/environment safety guards.
- C1: complete 14-migration chain applies from zero and is idempotent.
- C2: User, Session, AuthIdentity, reset-token, verification-token, FK, cascade, uniqueness, ownership, and hash-at-rest persistence.
- C3: real Prisma rollback, including atomic federated User + AuthIdentity creation and transaction-scoped client propagation.
- C4: persisted sequential refresh rotation; stale credentials reject after replacement.
- C5: concurrent same-token refresh regression initially reproduced double success. Root cause was SELECT-by-hash followed by unconditional UPDATE. The fix is a PostgreSQL compare-and-swap update requiring the expected old hash, active/non-expired state, and exactly one affected row. Repeated two-request and five-request races now produce one winner and reject all losers.
- C6: final model/persistence inventory, CAS predicate review, raw-secret scan, migration rebuild, cleanup, and regression review completed.

The refresh service returns session/replacement-refresh material at its service boundary; access-token issuance remains at the session/controller boundary. Password-reset and email-verification multi-write flows remain sequential; their partial-failure outcomes are consistency risks reviewed in C6, with no demonstrated credential disclosure or ownership bypass. Browser E2E through Phase 3.1.11.3C is complete; Phase 3.2 remains pending.

## Browser E2E infrastructure (Phase 3.1.11.3A)

Playwright is the single browser framework, with Chromium as the initial engine. The isolated runner uses frontend origin `http://127.0.0.1:4174`, backend origin `http://127.0.0.1:4100`, and only the disposable `cloudsight_test` PostgreSQL service on host port `5434`. It starts `postgres-test`, runs the guarded migration wrapper, verifies database identity, starts the real backend and Vite frontend, runs Playwright, and tears down child processes and only `postgres-test` in a `finally` block.

Run `npm run e2e:install` once in a fresh environment to install Chromium, then `npm run e2e` for the deterministic browser orchestration. The complete Phase 3.1.11.3C browser suite is now closed.

## HTTP authentication matrix (Phase 3.1.11.3B)

Added a guarded Supertest HTTP suite at `server/tests/http/auth/auth.http.test.ts` and the `npm run test:http:auth` lifecycle command. It uses the real Express app, middleware, controllers, Prisma client, and disposable `cloudsight_test` database. Coverage includes registration and duplicate-email handling, login/cookie issuance, authenticated `/auth/me`, safe login failure, Origin/CSRF enforcement, refresh rotation and stale-cookie replay, concurrent same-cookie refresh (one winner), and logout/cookie clearing. The route inventory covers the implemented `/auth` endpoints; reset/verification email delivery and live Google remain deterministic external-boundary work for later phases.

The continuation adds real HTTP coverage for owner-scoped logout-all, active-session listing, cross-user revocation protection, password change, configured security headers/CORS behavior, and the login rate limit. The expanded suite contains 12 tests and passes twice against clean disposable databases. Forgot/reset password, email-verification delivery, and controlled successful federated callback remain open because the current development email provider does not expose a safe injectable delivery capture boundary and live Google is intentionally excluded.

The email boundary is now test-capturable without changing production delivery: under `NODE_ENV=test`, the existing development provider records message payloads in a resettable test-only capture module; development and production modes remain unchanged. HTTP coverage now includes reset issuance/hash-at-rest, reset success/replay/invalid/expired cases, verification issuance/hash-at-rest, verification success/replay/invalid/expired cases. The HTTP suite has 17 tests and passes on clean disposable databases. Playwright has explicit evidence: Chromium smoke passed and `npm run e2e` exited 0; the child Vite shutdown emits an expected SIGTERM lifecycle message during teardown.

Federated HTTP verification uses a narrow test-only provider override in the registry. Production defaults remain the real Google provider; the override is accepted only with `NODE_ENV=test` and is explicitly reset after the test. It substitutes only external identity verification. The real Express callback, OAuth state/binding validation, federated service, Prisma User/AuthIdentity/Session persistence, cookie issuance, and refresh path remain exercised. A successful callback creates one User, one `(issuer, providerSubject)` AuthIdentity, and a real Session; repeating the same identity does not duplicate either account or identity, while a second identity remains isolated. Missing state, invalid state, and controlled provider failure produce safe redirects with no persisted account.

## Core browser auth journeys (Phase 3.1.11.3C)

Added deterministic Chromium coverage in `e2e/auth/core-journeys.spec.ts` using the real React application, AuthProvider, API client, Express server, Prisma, and disposable `cloudsight_test` PostgreSQL. The suite verifies email/password login, protected navigation, reload/session restoration, HttpOnly refresh-cookie visibility rules, safe invalid-login UX, browser registration, forgot-password submission UX, invalid reset-link UX, logout, protected-route rejection after logout, and post-logout reload behavior. It contains 5 tests including the existing smoke test and passed twice from clean database state (`5 passed`, exit code 0 each run).

The registration form is wired to the existing registration API with password confirmation and safe failure handling. A guarded E2E-only Prisma helper now revokes a selected `cloudsight_test` Session, proving the browser settles at `/login` after backing-session invalidation without a refresh loop. A minimal `/verify-email?token=...` page calls the existing verification API and displays safe loading/success/error states. The E2E runner passes a unique temporary email-capture file path to the test backend; the test-only development provider writes captured messages there with restrictive creation mode, and the runner deletes it during teardown. No production HTTP token endpoint was added.

The ten-test Chromium suite passed twice from clean disposable database state (`10 passed`, exit code 0 each run). It includes the complete browser password-reset lifecycle and the intentional resend-verification product flow. Resend is integrated into invalid-link recovery, uses the existing authenticated `POST /auth/resend-verification` contract with CSRF and rate limiting, displays generic safe confirmation, and the browser test confirmed delivery through the temporary E2E email capture bridge followed by successful verification. Raw verification tokens and passwords were absent from browser storage. The reset journey consumed the real reset token through `/reset-password`, rejected the old password, authenticated with the new password, reached protected UI, survived reload, and safely rejected token replay. The E2E runner starts the backend with `NODE_ENV=test` plus the explicit `CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER=1` flag; the registry selects the controlled provider only under both conditions, while production/development and malformed or absent flags retain normal Google-provider behavior. The controlled provider redirects the real initiation flow to the real callback with a deterministic external code; state validation, federated service, Prisma User/AuthIdentity/Session persistence, cookie issuance, `/auth/me`, refresh, and protected navigation remain real. A guarded E2E database assertion confirmed the deterministic User, AuthIdentity, and Session. The only production UI additions in this closure pass are the resend API and invalid-link recovery control; test-only changes remain guarded state helpers, email capture, controlled provider, startup flag, and browser tests.

## Phase 3.2.0 — Microsoft Entra ID architecture and implementation planning

**Status:** PLANNING COMPLETE; implementation not started.

### Existing federation architecture

The current Google flow is:

```text
Login UI → /auth/oauth/google/start → OAuthTransactionService
→ provider registry → authorization URL → /auth/oauth/google/callback
→ one-time state/binding consumption → code exchange and identity validation
→ FederatedAuthService → AuthIdentity/User resolution
→ SessionIssuanceService → HttpOnly refresh + CSRF cookies
→ /auth/oauth/complete → refresh + /auth/me + AuthProvider
```

The provider registry, `FederatedAuthProvider`, normalized identity contract, AuthIdentity persistence, `(issuer, providerSubject)` uniqueness, session issuance, cookies, typed errors, and frontend completion path are reusable. Google-specific pieces are the Google provider, Google routes/controller names, Google configuration/issuer validation, Google SDK, and Google-specific login messages. The federated service and callback currently also contain Google-only restrictions and require a narrow provider-neutral extension; a second federation stack is not warranted.

The OAuth transaction is currently process-local and in-memory. It atomically consumes state, enforces expiry/replay protection, and carries PKCE verifier, nonce, provider kind, and browser binding. It should be extended generically rather than duplicated for Entra; distributed persistence remains a deployment concern.

### Entra protocol, tenant, and identity decisions

Use OpenID Connect Authorization Code flow with PKCE (`S256`) and nonce validation. Use discovery metadata and JWKS-backed ID-token validation. Start with the **organizations** authority for work/school Entra tenants and an explicit allowed-tenant policy. Do not enable unrestricted `common` or `consumers` in the initial scope. Validate authorization redirect URI, code exchange, signature, `iss`, `aud`, `exp`, `nonce`, `tid`, and immutable `sub`; guest/B2B and personal identities must not be accepted accidentally.

The authoritative identity key remains `(issuer, providerSubject)`, never email. The existing AuthIdentity model can represent Entra without a schema change if issuer tenant semantics and validated `sub` are normalized consistently. `tid` must be validated and may remain transient unless a concrete tenant-query requirement justifies persistence. Missing, unverified, or untrusted email claims cannot create an account. Matching email with a local or Google account produces the existing generic link-required behavior; no automatic email linking or takeover is allowed. Different tenants with the same email remain separate immutable identities.

### Callback, errors, configuration, and sessions

Add a thin Entra initiation/callback adapter over the generic transaction and provider contracts. The callback consumes state before exchange, validates binding, exchanges code with PKCE, validates ID-token issuer/audience/signature/nonce/tenant, normalizes identity, then calls the existing federated service and session issuance path. Redirects are trusted configuration only. Cancellation, invalid/replayed state, exchange failure, invalid claims, unsupported tenant, missing identity, collision, outage, and persistence failures map to existing typed errors and generic browser-safe redirects. No codes, tokens, secrets, hashes, or provider internals appear in URLs or responses.

Future optional configuration consists of validated Entra client ID, confidential-client secret, authority/discovery/tenant policy, and exact redirect URI. Missing configuration leaves Google unchanged; partial configuration fails closed. No variables are added in this planning phase.

CloudSight remains the only session authority: database Session, hashed/rotated refresh token, HttpOnly cookie, CSRF, trusted origin, revocation, logout, logout-all, and access-token session enforcement are reused. Microsoft access/refresh tokens are not CloudSight credentials and should not be requested or stored without a concrete Microsoft API requirement. Local logout remains authoritative; remote provider logout is deferred. Minimum scopes are `openid`, `profile`, and `email` where available; no Graph permissions are requested.

### Migration and dependency decisions

No Prisma schema, migration, or audit-event migration is required by the current generic identity model. Prefer a maintained standards-focused OIDC implementation using discovery, JWKS, PKCE, and nonce validation; do not add a Microsoft-specific SDK merely for login. No dependencies are installed during 3.2.0.

### Test strategy

Future unit/service tests cover normalization, issuer/audience/signature/expiry/nonce and tenant validation, plus error mapping. HTTP tests cover initiation, success, cancellation, invalid/replayed state, provider failure, tenant rejection, collisions, safe redirects, and session issuance. PostgreSQL tests cover Entra identity uniqueness/isolation, rollback, and session ownership. Browser tests cover Microsoft initiation, controlled callback, authenticated navigation, reload, HttpOnly refresh behavior, and logout. Deterministic CI reuses the guarded startup-selected controlled provider (`NODE_ENV=test` plus explicit E2E flag); no live Microsoft authentication or provider-switch endpoint is introduced.

### Atomic implementation sequence

1. **3.2.1 Configuration/provider registration** — optional validated config and registry entry; Google unchanged when disabled. Gate: configuration matrix and no behavior change.
2. **3.2.2 Entra OIDC provider boundary** — discovery/JWKS, PKCE exchange, ID-token and tenant validation, normalized identity. Gate: invalid claims fail closed and secrets do not leak.
3. **3.2.3 Generic OAuth routing/transactions** — provider-neutral initiation/callback and state binding. Gate: one-time state, PKCE, nonce, expiry, and redirect safety.
4. **3.2.4 Federated service/collision integration** — remove Google-only assumptions and preserve explicit link-required behavior. Gate: no email takeover.
5. **3.2.5 Client integration** — Microsoft control and provider-neutral completion/errors through existing AuthProvider. Gate: no provider tokens in browser storage.
6. **3.2.6 Deterministic verification** — unit, HTTP, PostgreSQL, and Chromium tests using the guarded controlled provider. Gate: test-only control; Google and all existing regressions remain green.
7. **3.2.7 Security/regression closure** — complete suites, threat review, cleanup, and documentation. Gate: no unresolved issuer/tenant/collision/token-leakage issue.

**Immediate next action:** preserve the completed Phase 3.2.3 backend routing evidence and prepare only the later frontend Microsoft provider-control milestone. Phases 3.2.1–3.2.3 established configuration, provider validation, routing, and transaction integration.

## Phase 3.2.1 — Microsoft Entra ID configuration + provider registration foundation

**Status:** COMPLETE; protocol boundary is complete in Phase 3.2.2.

Implemented only the typed optional configuration foundation. Entra is disabled when all `ENTRA_*` variables are absent; complete configuration requires client ID, client secret, `organizations` authority, exact redirect URI, and a non-empty comma-separated allowlist of valid tenant GUIDs. Partial or invalid configuration fails closed, rejects `common`/`consumers`/wildcards, normalizes tenant IDs, and never echoes secrets. The redirect URI is parsed and restricted to HTTP(S) trusted configuration.

The stable provider identifier is `MICROSOFT`, matching the existing `FederatedProviderKind` and `AuthIdentity.provider` enum. `FEDERATED_PROVIDER_CONFIGS` and `getFederatedProviderConfig()` can represent Google and Entra without collision, while no fake Entra protocol provider or callback behavior was added. Google configuration and registration remain unchanged. The controlled E2E provider still requires both `NODE_ENV=test` and `CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER=1`.

Focused configuration/registration coverage is 11/11 PASS. It covers absent, complete, partial, malformed, forbidden authority, tenant normalization, Google independence, and Google/Entra coexistence. Server tests, typecheck, build, and `git diff --check` pass. No network, credentials, Prisma change, migration, token exchange, discovery, JWKS, frontend UI, or callback behavior was introduced.

**Exact next phase:** Phase 3.2.3 — Generic OAuth routing and transaction integration.

## Phase 3.2.2 — Microsoft Entra ID OIDC provider boundary

**Status:** COMPLETE; generic OAuth routing/callback integration remains Phase 3.2.3.

Added the standards-focused `jose` runtime dependency and a real
`EntraOidcProvider` boundary. It uses trusted organizations discovery metadata,
constructs authorization URLs with `code`, configured scopes, state, PKCE
S256, and nonce, and exchanges authorization codes with the configured redirect
URI and verifier. Discovery endpoints are HTTPS Microsoft endpoints and the
discovered issuer must match the configured organizations issuer.

ID tokens are cryptographically verified with locally materialized discovered
JWKS and RS256, then validated for audience, expiration/not-before (via the
OIDC verifier), nonce, tenant GUID allowlist, and exact tenant-specific issuer
equality (`https://login.microsoftonline.com/{normalizedTid}/v2.0`) before
requiring an immutable subject. The normalized identity uses `MICROSOFT`, the validated
tenant issuer, and `sub`; email is optional and accepted only with an explicit
`email_verified` claim. Unusable email claims never become identity authority.
Provider errors are translated to the existing generic federated-provider
domain error without exposing codes, tokens, secrets, or discovery internals.

The registry instantiates Microsoft only when complete validated configuration
exists; Google and the doubly guarded controlled E2E provider remain unchanged.
No callback route, frontend control, session behavior, Prisma schema, or
migration was added. Focused provider tests cover URL construction, PKCE code
exchange, malformed responses, cryptographic signature, audience, expiration,
nonce, subject, tenant, issuer, and email policy. The complete server suite is
green (`17` files: `80` passed, `33` skipped), typecheck and build pass, and
`git diff --check` passes without Microsoft network access.

**Exact next phase:** Phase 3.2.3 — Generic OAuth routing and transaction
integration. Add provider-neutral initiation/callback routing only after
preserving the existing one-time state, browser binding, PKCE, nonce, expiry,
and trusted redirect protections.

## Phase 3.2.3 — Generic OAuth routing + transaction integration

**Status:** COMPLETE (historical checkpoint; frontend Microsoft controls were completed in Phase 3.2.5).

Provider-neutral start/callback routes and finite registry-backed provider
resolution are implemented. Existing Google routes remain compatible. State
transactions remain one-time, expiring, provider-bound, browser-bound, and
PKCE/nonce carrying. Callback failures redirect only to trusted frontend
destinations, and no schema or migration changes were introduced.

Google and Microsoft now converge after normalized identity through a finite
supported-provider policy. New Microsoft identities use the existing atomic
User/AuthIdentity transaction, while existing identity lookup remains keyed by
issuer and immutable subject. Password and cross-provider same-email collisions
remain non-linking and non-authenticating; unsupported provider kinds fail
closed. No collision policy, schema, migration, session semantics, or provider
token persistence changed.

HTTP federation remains green at `17/17`; the server suite is green with `92`
passing and `33` skipped tests; typecheck, build, and `git diff --check` pass.

**Exact next phase:** the later frontend Microsoft provider-control milestone;
do not begin it as part of this backend routing phase.

## Phase 3.2.5 — Microsoft frontend provider control + client integration

**Status:** COMPLETE.

The login form exposes an accessible “Continue with Microsoft” control that
navigates only to CloudSight’s generic `/auth/oauth/microsoft/start` route.
Microsoft protocol, tenant, discovery, token, and secret data remain server
side. OAuthCompletePage and the existing AuthProvider, `/auth/me`, refresh,
ProtectedRoute, and HttpOnly session-cookie paths are reused.

Microsoft is build-time enabled only with `VITE_MICROSOFT_AUTH_ENABLED=true`;
the E2E runner sets that flag alongside the existing doubly guarded controlled
provider (`NODE_ENV=test` plus
`CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER=1`). Builds without the flag do
not render a broken Microsoft control, while the backend remains fail-closed
when Entra is unavailable. Google and password login remain available.

The legacy `User.authProvider` field was audited repository-wide. It is legacy
metadata/presentation and is not used as identity authority or for a
security-sensitive provider decision; `AuthIdentity(provider, issuer, sub)`
remains authoritative. No schema or migration changes were made.

The real Chromium suite passed twice (11/11 each), including Microsoft
initiation, controlled callback, real User/AuthIdentity/Session persistence,
protected navigation, reload/session restoration, HttpOnly refresh-cookie
behavior, and browser-storage checks. Google federation, password login,
registration, recovery, verification, logout, and revoked-session journeys
remained green. PostgreSQL is 16/16; HTTP auth is 17/17; server tests are
92 passed and 33 skipped; typecheck, build, and `git diff --check` pass. No
provider tokens are stored client-side and no live Microsoft network is used.

**Exact next phase:** Phase 3.2.6 — deterministic federation verification and
regression closure. Do not begin it in this frontend integration pass.

## Phase 3.2.6 — Deterministic federation verification + regression closure

**Status:** COMPLETE.

The final Phase 3.2 audit confirms one shared browser-to-session path for
Google and Microsoft: generic initiation, finite provider registry, one-time
browser-bound OAuth transaction, PKCE/nonce, provider verification,
normalized identity, existing federated service, AuthIdentity/User, CloudSight
Session, HttpOnly refresh cookie, OAuth completion, AuthProvider, `/auth/me`,
and protected navigation. Google and Microsoft intentionally differ only in
protocol validation (Google provider verification versus Entra discovery/JWKS,
RS256, tenant allowlist, and exact tenant issuer equality).

Focused federation/security tests pass `55/55`; HTTP auth passes `17/17`;
isolated PostgreSQL passes `16/16`; the full server suite passes `92` with
`33` skipped. Chromium passes `11/11` twice, including Google and Microsoft
browser journeys, password/recovery/verification coverage, revoked-session
behavior, protected navigation, and reload/session restoration. Typecheck,
build, and `git diff --check` pass.

The closure pass found and fixed one test-only lifecycle defect: Vite was
allowed to auto-select port 4175 when an orphan occupied 4174, while
Playwright still targeted 4174. The E2E runner now uses Vite `--strictPort` and
waits for backend/frontend ports to close during cleanup. No production auth
behavior changed. The controlled provider remains gated by
`NODE_ENV=test` plus `CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER=1`.

The repository-wide `User.authProvider` audit remains clear: it is legacy
metadata, not identity authority or a security-sensitive discriminator.
Identity authority remains provider + exact issuer + immutable subject; email
does not auto-link accounts. No provider credentials/tokens are persisted or
stored in browser storage, no open redirect exists, and no Prisma schema or
migration changes were made in this phase.

**Exact next phase:** Phase 3.3 — GitHub OAuth. The existing provider
abstraction, generic routing, transaction security, normalized identity, and
CloudSight session convergence are ready for GitHub without redesigning
Google or Microsoft. No GitHub implementation begins in this closure pass.

## Phase 3.3.0 — GitHub OAuth architecture + security planning

**Status:** COMPLETE (read-only planning; no application code, dependency,
schema, migration, or frontend changes made in this phase).

### Architecture decision

Use a GitHub OAuth App web authorization flow for CloudSight sign-in. A GitHub
App is reserved for repository/API installation and is not appropriate for
this authentication-only milestone. GitHub OAuth is OAuth authorization-code
flow rather than OIDC: it provides no ID token/discovery/JWKS identity path for
this use case. After code exchange, the provider uses the short-lived access
token only to call the trusted `api.github.com/user` endpoint and, when needed,
`api.github.com/user/emails`; the token is discarded and never becomes a
CloudSight credential. GitHub documents PKCE as strongly recommended for OAuth
web authorization and `user:email` as read access to private email addresses
([authorization flow](https://docs.github.com/en/apps/oauth-apps/using-oauth-apps/authorizing-oauth-apps),
[email API](https://docs.github.com/en/rest/users/emails)).

The provider will use `https://github.com` as its fixed issuer and the
immutable numeric GitHub user `id` (string form) as `subject`. `login`,
`node_id`, display name, avatar, and email are metadata; username changes can
never change identity authority. The resulting key remains
`(providerKind, issuer, subject)` through the existing AuthIdentity model.

Only `user:email` is required initially: the `/user` response supplies the
stable user and public profile, while `/user/emails` supplies a verified
primary/private address when the public email is absent. No `repo`, `workflow`,
organization, admin, or write permissions are requested. GitHub noreply
addresses are accepted only when returned as `verified` and `primary`; an
unverified or missing usable email produces the existing safe email-required
outcome and cannot create an account.

### Generic integration and protocol differences

GitHub reuses the generic start/callback routes, OAuth transaction store,
cryptographic state, expiry, one-time consumption, browser binding, provider
binding, trusted callback URI, PKCE verifier, FederatedAuthService,
AuthIdentity/User transaction, CloudSight Session, HttpOnly refresh cookie,
OAuthCompletePage, and AuthProvider. GitHub has no ID-token nonce to validate,
so the transaction nonce remains unused for this provider; no fabricated
GitHub nonce semantics are introduced. A small provider-neutral contract
extension may make the ID-token-only `verifyIdentity` operation optional or
represent an API-backed exchange explicitly; Google and Microsoft behavior
must remain unchanged.

Callback errors, cancellation, invalid/replayed state, browser/provider
mismatch, code exchange/API failure, rate limiting, malformed responses,
missing user ID, unusable email, collision, and persistence errors map to
existing generic typed errors. Authorization codes, access tokens, private
email lists, provider responses, and client secrets never appear in logs,
URLs, or browser responses. GitHub hosts are fixed HTTPS configuration; no
request controls authorization, token, API, or redirect endpoints. API calls
use bounded timeouts and no aggressive retries; provider rate-limit failures
fail closed.

The initial scope is `github.com` only. GitHub Enterprise Server and Enterprise
Managed Users are explicitly deferred; arbitrary enterprise hosts cannot be
selected by browser input. CloudSight local logout remains authoritative.
Same-email password, Google, or Microsoft accounts never auto-link, and a
different GitHub subject never authenticates by email. `User.authProvider`
remains legacy metadata; AuthIdentity remains authoritative. Existing generic
AuthIdentity fields are sufficient, so no Prisma migration is planned.

### Configuration and deterministic verification

Future optional configuration follows the existing model: absent GitHub
variables disable the provider safely; partial or invalid client ID, secret,
and exact callback URI configuration fails closed; complete configuration
registers `GITHUB`. No secret defaults or credentials are committed.

Deterministic tests will extend the startup-only controlled provider with
`GITHUB` under both existing guards (`NODE_ENV=test` and the explicit E2E
flag). No provider-switch endpoint, request-selected identity, live GitHub
network, or verification bypass is permitted. Unit tests cover configuration,
URL/PKCE/scopes, exchange/API parsing, verified email selection, username and
email changes, collisions, and registry guards. HTTP tests cover state,
binding, replay, callback, identity resolution, safe redirects, and session
issuance. PostgreSQL tests cover GitHub AuthIdentity/Session ownership and
rollback. Chromium covers GitHub initiation, controlled callback, protected
navigation, reload, HttpOnly cookies, and storage safety while retaining all
Google/Microsoft/password regressions.

### Atomic implementation roadmap

1. **Phase 3.3.1 — configuration/provider registration:** add optional,
   validated GitHub config and finite registry entry. Gate: absent/partial/
   invalid/complete matrix; Google/Microsoft unchanged. Stop before protocol.
2. **Phase 3.3.2 — GitHub OAuth provider boundary:** implement trusted OAuth
   URL, PKCE code exchange, `/user` and verified-email resolution, immutable
   subject normalization, token disposal, bounded network behavior, and typed
   errors. Gate: no token leakage, no email-as-identity, deterministic tests.
   Stop before routing changes.
3. **Phase 3.3.3 — generic routing/federated integration:** register GITHUB
   in generic routes and supported-provider policy; reuse existing collision
   and session paths. Gate: state/provider/browser binding, replay rejection,
   atomic User/AuthIdentity, safe collision behavior. Stop before frontend.
4. **Phase 3.3.4 — frontend provider control:** add the capability-gated
   GitHub control using only `/auth/oauth/github/start`; reuse completion and
   AuthProvider. Gate: accessible UI, safe unavailable/failure behavior, no
   provider data client-side.
5. **Phase 3.3.5 — deterministic verification:** extend controlled E2E mode;
   run unit, HTTP, PostgreSQL, and Chromium GitHub journeys plus regressions.
   Gate: real CloudSight persistence/session/cookies and no live GitHub.
6. **Phase 3.3.6 — security/regression closure:** exact host/scope/token/
   email threat review, cleanup, documentation, and complete test matrix.
   Gate: all existing Google/Microsoft/password suites remain green.

**Exact next subphase:** Phase 3.3.1 — GitHub configuration/provider
registration. Do not implement it in this planning pass.

## Phase 3.3.1 — GitHub configuration + provider registration

**Status:** COMPLETE.

Added optional server-only GitHub OAuth App configuration using
`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URI`. All
three absent disables GitHub safely; any partial set fails closed; complete
configuration validates an absolute HTTP(S) callback URI, uses the fixed
issuer `https://github.com`, and exposes only the `user:email` scope. No
secret defaults, Vite variables, URLs, responses, or logs contain the client
secret. No GitHub network behavior was introduced.

`GITHUB` is already a finite provider-kind member and is represented in the
typed configuration model. The production registry intentionally does not
instantiate an operational GitHub provider until the Phase 3.3.2 protocol
boundary exists. Consequently GitHub account creation and generic GitHub
authentication remain unavailable and fail closed; the existing Google and
Microsoft providers are unchanged. The controlled E2E provider remains
doubly guarded and GitHub browser testing is not enabled.

Focused configuration/registry tests pass `22/22`; the full server suite
passes `104` with `33` skipped. Typecheck, build, and `git diff --check` pass.
No Prisma schema or migration changed, no frontend GitHub control was added,
and no GitHub credentials or network access were used.

**Exact next subphase:** Phase 3.3.2 — GitHub OAuth provider boundary. Do not
begin it in this configuration/registration phase.

## Phase 3.3.2 — GitHub OAuth provider boundary

**Status:** COMPLETE.

Implemented the real server-side GitHub OAuth App provider boundary without
adding routes, frontend controls, account creation, repository permissions,
schema changes, or migrations. Authorization URLs use only the fixed
`https://github.com/login/oauth/authorize` endpoint, trusted client/callback
configuration, `user:email`, state, and PKCE S256. Authorization-code exchange
uses only the fixed GitHub token endpoint and sends the original PKCE verifier.

The access token is consumed only inside the provider for fixed HTTPS calls to
`https://api.github.com/user` and `/user/emails`; it is never returned,
persisted, logged, placed in cookies, or passed to the frontend. Responses are
runtime-validated. The immutable identity is `GITHUB` + issuer
`https://github.com` + numeric GitHub `id` converted to a string. `login`,
email, and profile fields are metadata only.

Email selection is explicit: `/user/emails` must contain exactly one
structurally valid entry with `verified=true` and `primary=true`. Verified
primary noreply addresses are accepted; verified secondary-only, unverified,
missing, malformed, and multiple-primary results fail closed. `/user.email`
alone is never trusted. Provider errors, malformed responses, timeouts, and
rate-limit/API failures map to a generic typed provider error without secrets,
codes, tokens, or response bodies.

The real provider is registered only when complete GitHub configuration exists.
Generic routing and FederatedAuthService account creation remain gated for the
next integration phase; GitHub is not yet a user-facing authentication path.
Google, Microsoft, and the doubly guarded controlled provider remain
unchanged.

Focused GitHub/provider regression tests pass `58/58`; the full server suite
passes `123` with `33` skipped. Typecheck, build, and `git diff --check` pass.
No GitHub network calls, frontend changes, Prisma changes, or migrations were
made.

**Exact next subphase:** Phase 3.3.3 — GitHub generic routing/federated
integration. Do not begin it in this provider-boundary phase.

## Phase 3.3.3 — GitHub generic routing + federated integration

**Status:** COMPLETE.

GitHub now enters the finite generic OAuth routing model through
`/auth/oauth/github/start` and `/auth/oauth/github/callback`. Provider
resolution remains registry-backed and rejects unknown provider strings. Start
creates the existing one-time, browser-bound transaction with PKCE and
redirects through the real GitHub provider; callback consumes that transaction,
passes the original verifier to the provider, and sends only normalized
identity data into the shared FederatedAuthService.

`GITHUB` is now an explicitly supported account-creation provider alongside
Google and Microsoft. New identities use the existing atomic User/AuthIdentity
path. Returning identities resolve exclusively by provider kind, exact issuer
`https://github.com`, and immutable numeric subject. Changed GitHub email or
login does not create a new account. Verified same-email local, Google, or
Microsoft accounts remain collision/link-required outcomes; no automatic
linking exists.

Successful callbacks use the existing CloudSight Session issuance, refresh
cookie, CSRF, audit, and trusted OAuth completion flow. GitHub access tokens
remain inside the provider and never enter User, AuthIdentity, Session, JWTs,
cookies, responses, URLs, logs, or frontend state. Provider failures and
malformed responses remain generic and sanitized. GitHub frontend UI remains
intentionally gated for Phase 3.3.4.

The deterministic PostgreSQL-backed HTTP matrix passes `17/17`, including
GitHub start, callback, new-account persistence, returning-identity reuse, and
duplicate prevention. The focused federation set passes `48/48`; the full
server suite passes `125` with `33` skipped. Typecheck, build, and
`git diff --check` pass. No live GitHub calls, schema changes, migrations,
repository permissions, or frontend changes were made.

**Exact next subphase:** Phase 3.3.4 — GitHub frontend sign-in control. Do not
begin it in this generic backend integration phase.

## Phase 3.3.4 — GitHub frontend sign-in control

**Status:** COMPLETE.

Added a first-class, presentation-gated `Continue with GitHub` control to the
login form. It renders only when `VITE_GITHUB_AUTH_ENABLED=true`, uses native
`type="button"` semantics, preserves the existing Google/Microsoft ordering,
and redirects only to CloudSight's generic `/auth/oauth/github/start` route.
No GitHub protocol logic, credentials, tokens, codes, state, or PKCE material
enters the browser. OAuthCompletePage and AuthProvider remain unchanged and
provider-neutral.

Authoritative local regression is green: the server suite reports `125 passed,
33 skipped, 0 failed`; typecheck passes; build passes; and `git diff --check`
passes. Repository-wide client lint remains red only because of exactly two
pre-existing, unrelated `react-hooks/set-state-in-effect` violations at
`client/src/components/reports/ExecutiveNotes.tsx:26` and
`client/src/pages/VerifyEmailPage.tsx:16`. No lint regression was reported in
the Phase 3.3.4 GitHub-auth changes. Earlier restricted-environment server
failures were infrastructure-specific Supertest listener-binding `EPERM`
errors, not application regressions, and are superseded by this authoritative
local run. No schema or migration changed, no repository permissions were
added, and no GitHub network behavior was moved to the frontend.

**Exact next subphase:** Phase 3.3.5 — deterministic GitHub verification. Do
not begin it in this frontend-control phase.

## Phase 3.3.5 — deterministic GitHub verification

**Status:** COMPLETE.

### Deterministic architecture and provider boundary

GitHub now participates in the existing startup-selected controlled federation
architecture under both mandatory guards: `NODE_ENV=test` and
`CLOUDSIGHT_E2E_CONTROLLED_FEDERATED_PROVIDER=1`. The server-controlled GitHub
identity is fixed to provider `GITHUB`, issuer `https://github.com`, numeric
subject `9001001`, and a verified deterministic email. The controlled provider
validates trusted callback and S256 challenge material, then redirects only to
the real CloudSight GitHub callback. It replaces only the external GitHub
authorization/token/user boundary. No provider-switch endpoint, request- or
browser-selected identity, arbitrary issuer/callback, GitHub credential, or
live GitHub request exists.

Everything after external verification remains the real stack: generic start,
cryptographic state, server-side PKCE verifier, browser/provider binding,
single-use transaction consumption, generic callback, FederatedAuthService,
atomic User/AuthIdentity persistence, CloudSight Session issuance, HttpOnly
refresh cookie, CSRF, OAuthCompletePage, refresh, `/auth/me`, AuthProvider, and
protected navigation. The E2E runner exposes only
`VITE_GITHUB_AUTH_ENABLED=true`; no GitHub client ID or secret is required.

### Browser and ownership results

Chromium exercised the visible `Continue with GitHub` control rather than
bypassing LoginForm. The button was visible, retained `type="button"`, did not
submit the password form, contained the decorative GitHub SVG, and entered
`/auth/oauth/github/start`. Stable decorative-icon assertions also covered the
Google and Microsoft controls.

The controlled journey created exactly one new User, one AuthIdentity with
`providerKind=GITHUB`, `issuer=https://github.com`, and
`providerSubject=9001001`, plus a real Session. Returning authentication reused
the same User/AuthIdentity and created a new valid CloudSight session without
duplicates. Reload and direct protected navigation restored authentication
through refresh-cookie bootstrap; explicit observed refresh rotation returned
200 without a provider token. Actual UI logout revoked the active session,
cleared browser authentication, blocked protected access, and did not restore
after reload.

Changed-email HTTP coverage supplied the same GitHub numeric subject with a
different verified-primary email. Authentication resolved the original user,
did not synchronize or create a second User, and retained one AuthIdentity.
Username authority is tested at the provider boundary: changing GitHub `login`
while keeping the numeric ID produces the same subject, and username is not
present in the normalized identity. Email and username therefore remain
non-authoritative metadata.

A real browser collision against an existing password account produced the
safe `account_link_required` UI, no refresh session, and no GitHub identity.
The PostgreSQL-backed HTTP matrix separately verified new GitHub subjects
colliding with existing Google and Microsoft accounts: neither auto-linked,
merged, issued a session, nor persisted an unauthorized GitHub AuthIdentity.
The existing accounts remained unchanged.

Reusing a consumed GitHub callback produced sanitized `oauth_failed` behavior,
no blank page or redirect loop, no state/code in the final URL, no second
identity, and no unintended session. OAuthTransactionService coverage proves
GitHub cannot consume Google state and Google cannot consume GitHub state; a
provider mismatch consumes the transaction and subsequent replay also fails.
Unknown providers remain finite-registry failures.

### Containment, network, and database audits

The GitHub provider unit boundary continues to prove `user:email`, fixed GitHub
HTTPS endpoints, trusted callback, PKCE S256, internal-only token consumption,
numeric subject normalization, verified-primary email policy, and sanitized
provider failures. Chromium recorded every browser request and asserted zero
requests to `github.com` or `api.github.com`. Both complete E2E runs used no
GitHub credentials and made no live GitHub request.

Browser URLs, DOM, localStorage, sessionStorage, JavaScript-readable cookies,
CloudSight JWT payload, captured auth JSON responses, and OAuth completion were
audited for provider-token material. The refresh token remained HttpOnly. The
database assertion serialized the persisted User, AuthIdentity, and Session
and found no access-token field/value; the Prisma models have no GitHub-token
column. Collision cases persisted no unauthorized GitHub identity. Built Vite
assets and client source contain no `GITHUB_CLIENT_SECRET`, GitHub secret value,
or GitHub client ID.

Verification exposed one genuine production logging defect: pino serialized
OAuth callback query credentials before the controller could replace
`req.url`, and serialized credential-bearing start redirect locations. The
smallest fix adds request/response log serializers that remove callback query
data and strip OAuth-sensitive query material from logged Location headers
without altering actual redirects. Regression coverage passes `4/4`, and live
E2E logs show callback `query={}` and query-free logged OAuth redirect
locations. Authorization codes, state, PKCE challenge/verifier, provider
tokens, cookies, authorization headers, and CSRF values are no longer exposed
through these log paths.

### Exact verification evidence

- GitHub provider plus controlled-boundary unit tests: `22/22` passed.
- Federated provider selection/config tests: `22/22` passed.
- Federated service/transaction/logging focused set: `20/20` passed at the
  mandated focused gate; the final expanded logging regression is `4/4`.
- Federated callback HTTP harness: `13/13` passed.
- Focused GitHub Chromium: `1/1` passed in `24.4s` (test body `20.9s`).
- Final full E2E run #1: `12/12` passed, `0` failed, `1.4m`, exit code `0`.
- Final full E2E run #2 after disposable teardown: `12/12` passed, `0` failed,
  `1.7m`, exit code `0`.
- PostgreSQL-backed HTTP auth: `17/17` passed in `4.09s`.
- Guarded PostgreSQL integration: `16/16` passed in `2.78s` using
  `cloudsight_test` on `127.0.0.1:5434`.
- Final server suite: `131` passed, `33` skipped, `0` failed.
- Relevant frontend verification: full Chromium coverage plus changed
  LoginForm ESLint pass; the client has no dedicated unit-test command.
- Root typecheck, root production build, and `git diff --check`: PASS.

Both final E2E runs recreated and removed only `cloudsight-postgres-test`.
Cleanup confirmed no remaining test container, no listener on E2E ports 4100
or 4174, no Playwright process, no `test-results/`, and no Playwright report.
A pre-existing development watcher on port 5001 was preserved. Every database
helper validates `NODE_ENV=test`, `TEST_DATABASE_URL`, the `cloudsight_test`
database name, and test port 5434; development PostgreSQL was not touched.

Google controlled federation, Microsoft controlled federation/tenant behavior,
and password login/restoration/logout remained green in both 12-test complete
Chromium runs. No repository scope, GitHub App behavior, account-linking
implementation, Prisma schema change, migration, dependency, repository
permission, or GitHub product functionality was added in Phase 3.3.5.

**Exact next subphase:** Phase 3.3.6 — GitHub security/regression closure. Do
not begin it without explicit authorization.

## Phase 3.3.6 — GitHub security/regression closure

**Status:** COMPLETE after remediation and validation of both post-closure
reviews.

The second `/review` identified five additional P1 findings covering the
production security environment, Entra discovery/email semantics, ALB-aware
rate limiting, and Google issuer canonicalization, plus two P2 findings covering
production OAuth feature flags and StrictMode email-verification duplication.
The earlier COMPLETE decision is invalid until these findings are independently
verified, resolved where confirmed, and every mandatory gate passes again.

A post-closure `/review` found four P1 defects (development CSRF startup,
legacy Google identity migration, refresh/logout response ordering, and
default optional OAuth configuration) plus one P2 provider-metadata defect.
This record intentionally preserves that the issues were found after the
earlier closure decision. All findings were subsequently remediated and every
required regression gate was repeated before restoring COMPLETE.

### Security review and fixes

The complete Phase 3.3 GitHub implementation was reviewed across the provider,
finite registry and configuration, generic start/callback, transaction and
browser binding, shared account/session paths, controlled provider, browser
coverage, frontend entry, logging, CSRF, rate limiting, environment files,
CSP, persistence, and build output. Final findings were `P0=0`, `P1=1`
resolved, `P2=2` resolved, and `P3=0`.

The resolved P1 was a tracked, credential-shaped GitHub fine-grained PAT in
`infrastructure/terraform/terraform.tfvars`, assigned to the sensitive
`container_registry_password` input intended for GitHub Container Registry
authentication. The token was reported revoked before remediation. The local
tfvars file is now absent from the Git index and ignored at its actual path;
the committed example contains only non-secret configuration and documents
runtime injection through `TF_VAR_password`, `TF_VAR_jwt_secret`,
`TF_VAR_container_registry_password`, and optional registry username. The
replacement token was never requested, displayed, stored, or passed to Codex.

Local history contains one affected commit: `b580e153de5bfcc0bd045f1828f41567fc29c02a`
from 2026-07-13. One remote (`origin`) exists, and remote-tracking `main` plus
four feature branches contain that commit, so the credential was shared.
Revocation neutralizes credential usability. Coordinated history rewriting is
recommended for repository hygiene, but was not performed; no force-push,
branch deletion, commit, or history mutation occurred.

The resolved P2 logging finding covered accepted mixed-case OAuth callback
paths and sensitive relative, protocol-relative, malformed, encoded, or
fragment-bearing `Location` values. The serializer now redacts those log-only
representations without mutating the actual request or response. The second
resolved P2 was `ip-address@10.2.0` in the runtime authentication rate-limit
chain; the compatible transitive dependency is now `10.5.0`.

### OAuth, token, identity, and email audits

GitHub authorization, token, user, and email endpoints remain fixed trusted
HTTPS constants. Callback and frontend completion destinations are
server-controlled. State remains cryptographically random, expiring,
single-use, provider-bound, and browser-bound. PKCE remains S256 with the
verifier server-side. Unknown providers fail closed, and the controlled
provider activates only when both `NODE_ENV=test` and the exact E2E flag are
present; production, development, and test-without-flag combinations remain
disabled, with no request-controlled activation.

The client secret, authorization code, and PKCE verifier are sent only from
the server to the fixed token endpoint. The provider access token is ephemeral
and used only for the fixed GitHub identity/email calls. It is not returned,
logged, persisted, placed in a CloudSight JWT or refresh token, or exposed to
the frontend. Malformed token/user/email bodies, invalid JSON, HTTP failures,
and network errors fail with generic sanitized behavior.

GitHub ownership remains `GITHUB + https://github.com + numeric subject`.
Username, email, display name, avatar, and access token are not identity
authority. Exactly one structurally valid verified-primary email is required;
unverified, secondary-only, missing, malformed, and ambiguous results fail
closed. Email matching alone never links accounts. Local, Google, and
Microsoft collisions retain the link-required policy, while changed email or
username for the same immutable subject cannot redefine ownership.

### Redirect, session, CSRF, rate-limit, and frontend audits

Provider authorization, CloudSight callback, completion, and error redirects
remain fixed or constructed from the trusted frontend origin. No return URL,
protocol-relative payload, encoded payload, issuer, endpoint, or callback
override was found. Provider-controlled errors and internal exceptions remain
absent from browser responses.

GitHub reuses the shared CloudSight session contract: HttpOnly refresh cookie,
environment-correct Secure behavior, SameSite policy, `/auth` path, hashed
refresh persistence, compare-and-swap rotation, old-token rejection, and
logout revocation. Refresh/logout retain trusted-origin and refresh-bound CSRF
validation; the legitimate OAuth GET callback did not create a mutation-route
CSRF exemption. Generic OAuth start/callback rate limits apply to GitHub.

LoginForm remains presentation/initiation-only, with `type="button"`,
capability gating, and decorative provider icons. It performs no provider API
request, token exchange, or code/state persistence. Helmet CSP was not widened
for GitHub; the production client bundle contains no GitHub secret, controlled
provider identifier, deterministic identity, or direct GitHub OAuth/API host.
Server artifacts contain the controlled provider implementation but preserve
the double runtime activation guard.

### Configuration, environment, dependency, and secret audits

GitHub backend configuration remains optional and fail-closed for partial or
invalid values. The frontend capability flag cannot enable backend support,
and no Vite GitHub secret variable exists. Current tracked-source scans find
no GitHub PAT, private-key marker, or literal OAuth credential assignment. The
safe local tfvars workflow is runtime/CI injection rather than tracked secret
storage.

`npm audit` initially reported eight high-severity advisories. The directly
relevant runtime rate-limit dependency was upgraded, leaving seven advisories
in development/build tooling and React Router. `npm audit --omit=dev` reports
only the React Router RSC server-action advisory; CloudSight is a Vite SPA and
does not implement RSC actions, so the vulnerable execution mode is absent.
No directly relevant unresolved high/critical vulnerability was demonstrated.
The separate AWS SDK warning states that releases after early January 2027
will require Node 22; verification currently used Node `20.20.2`.

### Regression evidence

- Focused GitHub/security matrix: `122/122` passed across `14` files.
- Expanded logging regression: `11/11` passed.
- Full server suite: `147` passed, `33` skipped, `0` failed.
- PostgreSQL-backed HTTP auth: `17/17` passed.
- Guarded PostgreSQL integration: `16/16` passed using only
  `cloudsight_test` on `127.0.0.1:5434`.
- Final E2E run #1: `12/12` passed, `0` failed, `1.4m`, exit code `0`.
- Final E2E run #2 after disposable teardown: `12/12` passed, `0` failed,
  `1.4m`, exit code `0`.
- Both E2E runs retained Google, Microsoft, password, session restoration,
  refresh, logout, GitHub network-containment, collision, replay, icon, and
  protected-navigation coverage.
- Root typecheck and production build: PASS.
- Changed Phase 3.3.6 TypeScript ESLint: PASS.
- Final `git diff --check`: PASS.

Both final E2E runs and the PostgreSQL suites created and removed only the
disposable `cloudsight-postgres-test` database. Cleanup found no test
container, listener on ports 4100/4174, E2E/Playwright process, or generated
Playwright result directory. The pre-existing development watcher on port
5001 was preserved. Development PostgreSQL was not touched.

### Post-closure review remediation

The final `/review` reopened Phase 3.3.6 with four confirmed P1 findings and
one confirmed P2 finding. Development startup had not explicitly defaulted
`NODE_ENV` before CSRF initialization; the uncommitted AuthIdentity migration
did not backfill legacy `User.googleId` ownership; logout could race an
already-rotated but delayed refresh response; `.env.example` accidentally
formed partial optional-provider configurations; and new Microsoft/GitHub
users were persisted with legacy metadata incorrectly hardcoded to `GOOGLE`.

The development entry now defaults `NODE_ENV` to `development` only when it
is absent, preserving explicit `test` and production-like values. The normal
`npm run dev:server` path started with both `NODE_ENV` and `CSRF_SECRET`
explicitly unset, while production/ambiguous configurations without a secret
remain fail-closed. All Google, Entra, and GitHub example variables are blank
when disabled; copied example configuration loads all providers as disabled,
while partial provider configuration continues to throw.

The existing uncommitted `20260810000000_add_auth_identities` migration now
backfills `GOOGLE + https://accounts.google.com + User.googleId` and extends
the legacy `AuthProvider` enum with `MICROSOFT` and `GITHUB`. A guarded
disposable migration test passed both the complete fresh migration chain and
a reconstructed pre-AuthIdentity database containing a legacy Google user;
the resulting identity resolved the same user by immutable subject even when
presented with a changed email. No additional migration directory was
created.

Refresh and session revocation are now explicitly coordinated: new refreshes
are blocked, any already-started response is allowed to finish browser cookie
processing, and only then does logout or logout-all revoke the now-current
credential. This avoids relying on `AbortController` or JavaScript generation
checks to prevent browser `Set-Cookie` handling. A deterministic delayed
refresh regression proved replacement-cookie processing occurs before logout
clears/revokes the session. Normal refresh, restoration, logout, logout-all,
CSRF, and replay behavior remained green.

Federated account creation now maps Google to `GOOGLE`, Microsoft to
`MICROSOFT`, and GitHub to `GITHUB`; local users remain `LOCAL`. Password-login
failure wording and the shared OAuth completion failure page are now
provider-neutral, eliminating the second-order P2 Google-only UX assumption.
`AuthIdentity(providerKind, issuer, providerSubject)` remains the ownership
authority; `User.authProvider` remains descriptive legacy metadata.

Post-remediation evidence on final code:

- Focused authentication/security matrix: `147/147` passed across `18` files.
- Migration verification: fresh chain and legacy Google backfill PASS against
  only `cloudsight_test` on `127.0.0.1:5434`.
- Full server suite: `155` passed, `34` skipped, `0` failed.
- PostgreSQL-backed HTTP auth: `17/17` passed.
- Guarded PostgreSQL integration: `17/17` passed.
- The first diagnostic E2E attempt reproduced an environment-bootstrap bug at
  `7/12`; the corrected dev entry preserves explicit `NODE_ENV=test`.
- Final E2E run #1: `12/12` passed, `0` failed, `1.3m`, exit code `0`.
- Final E2E run #2: `12/12` passed, `0` failed, `1.3m`, exit code `0`.
- Root typecheck, production build, changed-client-source ESLint, and final
  `git diff --check`: PASS.
- Final tracked-source scan found zero live GitHub PAT/private-key patterns;
  the production client build contains no GitHub secret, controlled-provider
  identity, or direct GitHub OAuth/API endpoint.
- `npm audit` remains at seven high advisories already classified as
  development/build tooling or React Router RSC behavior absent from this Vite
  SPA; no directly relevant auth-path exploit was demonstrated and no blind
  dependency update was performed.
- Cleanup found no disposable database, E2E listener on 4100/4174,
  Playwright/E2E process, `test-results`, or `playwright-report`. Only the
  guarded `cloudsight_test` database was used; development/production database
  containers were not touched.

This remediation made the proven-required Prisma enum/backfill correction but
added no OAuth scope, repository permission, account linking, GitHub App
behavior, new provider, or GitHub product integration. It made no new
dependency or lockfile change; the earlier compatible `ip-address@10.2.0` to
`10.5.0` lockfile correction remains the only Phase 3.3.6 dependency change.

### Second post-remediation review closure

The second `/review` again reopened Phase 3.3.6 and found five confirmed P1
defects plus two confirmed P2 defects. This record preserves that the defects
were discovered after the first remediation had restored COMPLETE.

Production deployment now explicitly obtains the required CSRF secret and
CORS origin through the established SSM-to-staged-environment path and passes
them into the server container. Missing values remain fail-closed; no secret
was hardcoded, printed, added to Terraform state, or committed. A tracked safe
production template was added because deployment packaging already required
that path. The deployment path also now consistently targets the client Nginx
listener on port 80.

Microsoft discovery now requires the documented tenant-template issuer and
fixed organizations authorization, token, and JWKS endpoints. Token validation
continues to require RS256, the exact audience and nonce, an allowed GUID
tenant, the exact concrete issuer derived from that tenant, and a compatible
signing-key issuer. Entra email metadata is selected from syntactically valid
`email`, `preferred_username`, then `upn` claims without relying on the
non-standard `email_verified` claim. Email remains non-authoritative: immutable
ownership remains provider, exact issuer, and subject; unusable email prevents
new-account creation but does not prevent an existing immutable identity from
authenticating.

Production proxy trust is restricted to the fixed internal Docker proxy
subnet rather than enabled globally. The ALB appends the forwarding chain,
Nginx passes that chain unchanged, and Express trusts only the immediate
internal proxy. Direct/untrusted peers cannot select the rate-limit key through
a forged forwarding header, while distinct ALB client addresses receive
distinct login-limit buckets.

Both accepted Google token issuer spellings now normalize to the single
canonical persisted issuer `https://accounts.google.com` before identity
classification, lookup, and persistence. This aligns live authentication with
the legacy Google backfill and prevents an issuer-spelling email collision or
duplicate identity.

The production client Docker build now accepts only public Google/Microsoft/
GitHub presentation inputs and the public API path. The build and publish
workflows pass those public values through root-context builds, defaulting the
optional controls off. Real production-image browser checks proved Microsoft
and GitHub controls can be enabled, remain hidden when disabled, and never add
provider secrets to the browser bundle.

Email verification now atomically claims a valid token, verifies the user,
and writes its audit event once. A consumed token for the already-verified user
returns the same successful domain result. The page also guards its effect
against React StrictMode replay. Concurrent and repeated verification requests
therefore cannot produce success followed by misleading failure or duplicate
state/audit side effects.

Three in-scope second-order deployment defects were also corrected: the
production environment template expected by packaging was missing; container
workflows used build contexts incompatible with the workspace Dockerfiles; and
the Terraform target-group port differed from the production client mapping.
No unrelated refactor was performed.

Final second-review evidence on the final code:

- Focused final delta: `29/29` passed across `4` files; the broader focused
  security/authentication selection passed `108/108` across `14` files.
- Full server suite: `167` passed, `34` skipped, `0` failed.
- PostgreSQL-backed HTTP auth: `17/17` passed, exit code `0`.
- Guarded PostgreSQL integration: `17/17` passed using only
  `cloudsight_test` at `127.0.0.1:5434`.
- Fresh migration chain and legacy Google backfill verification: PASS using
  the same guarded disposable PostgreSQL instance.
- Final E2E run #1: `12/12` passed, `0` failed, `1.5m`, exit code `0`.
- Final E2E run #2 after independent teardown/provisioning: `12/12` passed,
  `0` failed, `1.4m`, exit code `0`.
- Root typecheck, production build, changed-client-source ESLint, Terraform
  validation, production server security initialization, and final
  `git diff --check`: PASS.
- Enabled production client image: Google, Microsoft, and GitHub controls each
  rendered once. Disabled image: Google rendered once while Microsoft and
  GitHub rendered zero times. Frontend source and bundle secret scans passed.
- Production configuration without CSRF or CORS remains fail-closed; complete
  non-secret/test-placeholder initialization passed without database access.
- OAuth logging, controlled-provider double guard, credential containment,
  session/cookie/CSRF behavior, rate-limit proxy behavior, Google/Microsoft/
  password regressions, and immutable identity/collision policy remained
  green.
- Final unresolved findings are `P0=0`, `P1=0`, `P2=0`, and `P3=0`.
- No schema or migration was added in this second remediation. No dependency
  or lockfile changed. No deployment was performed and development PostgreSQL
  was not touched.

Cleanup removed the disposable database, validation containers and images,
generated Terraform provider cache, and Playwright result artifacts. No E2E,
Playwright, validation-server, or disposable-database process remained.

**Recommended next action:** coordinate removal of the revoked credential from
shared Git history as a separate repository-hygiene task. Product development should
proceed with **Phase 5.0 — Organization / Multi-Tenancy Architecture Audit**. Generic
OIDC (Phase 3.4), SAML (Phase 3.5), and advanced authentication security (Phase 4)
remain deferred until a concrete customer, compliance, or enterprise requirement
justifies the implementation cost.

---

# 2026-08-24 Development Checkpoint

## Authentication Status

Core authentication remains complete and stable:

- Email/password authentication
- Database-backed sessions
- HttpOnly refresh-token cookies
- Refresh-token hashing and rotation
- Session revocation
- CSRF and trusted-origin protection
- Google authentication
- Microsoft Entra ID authentication
- GitHub authentication
- OAuth state, PKCE, nonce, issuer, and signature validation

Authentication-specific development is paused at this checkpoint.

## Repository Stabilization and Cleanup Completed

Completed today:

- Dashboard service-breakdown response fix
- Entra OIDC validation-test stabilization
- Organization-scoped monthly budget service and tests
- Removal of obsolete budget snapshot repository code
- Recovery of the required historical monthly-budget migration
- Organization-scoped analytics and alert backend paths
- Frontend organization-aware query isolation
- Tenant-aware reports and historical trends
- Removal of obsolete CSS backup files
- Docker and CI hardening
- Terraform ALB/X-Forwarded-For validation
- Terraform variable ignore hardening
- Removal of generated Prisma seed JavaScript artifacts
- Product roadmap documentation refresh

## Multi-Tenancy and RBAC

Completed:

- Organization and membership model
- OWNER, ADMIN, MEMBER, and VIEWER roles
- Server-side organization context
- Server-side RBAC enforcement
- Tenant-safe organization membership resolution
- Organization-scoped accounts
- Organization-scoped analytics
- Organization-scoped forecasts
- Organization-scoped alerts
- Organization-scoped budgets
- `X-Organization-Id` propagation
- Tenant-aware React Query cache keys
- Active workspace persistence
- Workspace switching
- Cross-organization membership isolation

The backend remains authoritative for authorization. Client-provided organization IDs and frontend role checks are not security boundaries.

## Workspace Onboarding and Frontend Organization Context

Completed:

- Organization creation
- Workspace onboarding
- Active organization persistence
- Workspace switcher
- `OrganizationProvider`
- Organization context hook
- Tenant-aware query execution
- Protected routes requiring valid workspace context

## Organization Settings

Completed:

- Protected `/settings/organization` route
- Current workspace name, slug, and role display
- OWNER-only organization rename controls
- Organization-name validation
- Organization context refresh after successful rename
- Server-side `ORGANIZATION_MANAGE` permission enforcement
- Read-only behavior for unauthorized roles

## Team and Member Management

Completed:

- Protected `/settings/team` route
- Organization member listing
- Existing-user member addition
- OWNER and ADMIN management flows
- Role assignment
- Role changes
- Member removal
- OWNER-specific ability to assign OWNER
- ADMIN restrictions against assigning or modifying OWNER
- Final-owner protection
- Cross-organization membership protection
- Member API types and frontend API functions

Frontend RBAC checks are UX controls only. Server-side authorization remains authoritative.

## Authentication and Session Guarantees Preserved

Today's tenancy, deployment, and UI work preserves:

- Database-backed sessions
- HttpOnly refresh cookies
- Refresh-token hashing and rotation
- Session revocation
- Access-token JWT validation
- CSRF protection
- Trusted-origin validation
- Credentialed CORS
- Google authentication
- Microsoft Entra ID authentication
- GitHub authentication
- OAuth state / PKCE / nonce protections
- Federated identity issuer validation
- Logout and logout-all semantics

## Docker / CI / Production Runtime Hardening

Completed:

- Root Docker build contexts
- `.dockerignore`
- Production client API build configuration
- Microsoft and GitHub frontend auth build flags
- Required production `CSRF_SECRET`
- Required production `CORS_ORIGIN`
- OAuth provider runtime configuration support
- Production port normalized to port 80
- CI Docker validation environment
- Updated production smoke tests
- Hardened SSM runtime environment generation
- Required and optional SSM parameter handling
- Runtime environment escaping

## Proxy / Infrastructure Hardening

Completed:

- Fixed Docker proxy subnet
- Nginx X-Forwarded-For chain preservation
- ALB `xff_header_processing_mode = "append"`
- Terraform production variable example updates
- Terraform initialization and validation
- Terraform local variable files ignored while preserving the checked-in example

## Verification Completed

```text
BudgetService:
24 tests passed

Entra OIDC provider:
14 tests passed

Server TypeScript:
PASS

Client TypeScript:
PASS

Client production build:
PASS

Docker development Compose:
PASS

Docker production Compose:
PASS

Terraform fmt -check -recursive:
PASS

Terraform validate:
PASS

git diff --check:
PASS
```


## Major Commits Completed

```text
49d2620 fix(dashboard): include service breakdown in summary
6cfcd1a test(auth): stabilize Entra OIDC validation
0cdf1d4 refactor(budget): use organization-scoped monthly budgets
70f81c8 refactor(tenancy): scope analytics and alerts by organization
0b11d6b feat(tenancy): add organization-aware frontend context
eb65926 refactor(client): route reports and trends through tenant context
644cf7c style(client): update auth styles and remove backups
f4d8205 ci(docker): harden container builds and production runtime
2d09f92 infra(terraform): preserve ALB client IP forwarding
21dc5f6 chore(repo): ignore local Terraform vars and remove generated Prisma artifacts
653c978 docs: update CloudSight implementation roadmap
a6c3423 feat(settings): add organization settings page
eec6885 feat(settings): add team member management
```
