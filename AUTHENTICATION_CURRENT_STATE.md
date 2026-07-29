# CloudSight Authentication Current State

**Version:** **1.7.0-alpha**

**Branch:**

```text
feature/frontend-security-sessions
```

---

# Authentication Architecture

CloudSight follows a strict layered architecture.

```text
                    Frontend

React UI
    │
    ▼
ProtectedRoute
    │
    ▼
AuthProvider
    │
    ▼
useInitializeAuth()
    │
    ▼
React Query
    │
    ▼
GET /auth/me
    │
    ▼
Shared API Client

──────────────────────────────────────────

                    Backend

HTTP Request
      │
      ▼
Express Route
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Repository
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

## Architecture Principles

- Business rules never live inside controllers.
- Controllers are responsible only for HTTP request/response handling.
- Services contain business logic.
- Repositories are the only layer allowed to communicate with Prisma.
- Authentication is fully session-aware through database-backed sessions.
- All protected routes are authenticated through JWT access tokens.
- Every authenticated request is tied to a persistent database session.

---

# Authentication Features

## Local Authentication

- ✅ User Registration
- ✅ Email / Password Login
- ✅ BCrypt Password Hashing
- ✅ Password Verification
- ✅ JWT Access Tokens
- ✅ Refresh Tokens
- ✅ Persistent Sessions
- ✅ Logout
- ✅ Logout All Sessions

---

## Frontend Authentication

- ✅ AuthProvider
- ✅ Auth Context
- ✅ Protected Routes
- ✅ Persistent Login
- ✅ Token Storage
- ✅ Shared API Client
- ✅ Automatic User Restoration
- ✅ Automatic Logout on Invalid Token
- ✅ Authentication Initialization
- ✅ Route Protection

---

# Enterprise Security Center

CloudSight now includes a dedicated Security Center for authenticated users.

## Current Capabilities

```text
Security
├── Active Sessions
├── Current Device Detection
├── Session Management
├── Session Revocation
├── Logout All Devices
└── Protected Security Route
```

## Current Features

- ✅ Security Dashboard
- ✅ Protected `/settings/security`
- ✅ Active Session Listing
- ✅ Current Device Detection
- ✅ Browser Detection
- ✅ Operating System Detection
- ✅ IP Address Display
- ✅ Session Expiration
- ✅ Session Revocation
- ✅ Logout All Devices
- ✅ React Query Integration

---

# JWT Authentication

## Algorithm

```text
HS256
```

## Current JWT Payload

```json
{
  "userId": "...",
  "email": "...",
  "sessionId": "...",
  "iat": "...",
  "exp": "..."
}
```

## Access Token Lifetime

```text
15 Minutes
```

## Refresh Token Lifetime

```text
30 Days
```

Refresh tokens are cryptographically secure random values generated using Node.js `crypto`.

---

# Session Management

Every successful login creates a persistent database-backed session.

## Session Model

```text
Session
├── id
├── userId
├── refreshTokenHash
├── expiresAt
├── lastUsedAt
├── revokedAt
├── createdAt
├── updatedAt
├── ipAddress
├── userAgent
└── deviceName
```

## Current Capabilities

- ✅ Create Session
- ✅ Validate Refresh Token
- ✅ Refresh Session
- ✅ Rotate Refresh Token
- ✅ Touch Session
- ✅ Revoke Session
- ✅ Revoke All Sessions
- ✅ Delete Expired Sessions
- ✅ List Active Sessions

---

# Session-Aware JWT

Each access token contains the originating database session.

## Example

```json
{
  "userId": "...",
  "email": "...",
  "sessionId": "...",
  "iat": 1784773679,
  "exp": 1784774579
}
```

## Benefits

- Current device identification
- Device-aware authorization
- Logout a specific device
- Logout all other devices
- Audit logging foundation
- Refresh token reuse detection
- MFA foundation
- Passkey foundation

---

# React Authentication Architecture

```text
Browser
     │
     ▼
React Router
     │
     ▼
ProtectedRoute
     │
     ▼
AuthProvider
     │
     ▼
React Query
     │
     ▼
GET /auth/me
     │
     ▼
Express API
```

---

# Session Request Flow

```text
Browser
      │
      ▼
Authorization Header
      │
      ▼
authenticateToken()
      │
      ▼
Controller
      │
      ▼
SessionService
      │
      ▼
SessionRepository
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

---

# API Endpoints

## Public

```http
POST /auth/register
POST /auth/login
POST /auth/refresh
```

## Protected

```http
GET /auth/me
GET /auth/sessions
POST /auth/logout
POST /auth/logout-all
DELETE /auth/sessions/:sessionId
```

---

# Repository Layer

## UserRepository

```text
findByEmail()
findById()
create()
```

## SessionRepository

```text
create()
findById()
findByRefreshTokenHash()
findActiveByUserId()
update()
updateRefreshTokenHash()
touch()
revoke()
revokeAllForUser()
deleteExpired()
```

---

# Service Layer

## AuthService

```text
registerUser()
loginUser()
getCurrentUser()
logoutUser()
```

## SessionService

```text
createSession()
validateRefreshToken()
refreshSession()
rotateRefreshToken()
touch()
revokeSession()
revokeAllSessions()
cleanupExpiredSessions()
listActiveSessions()
```

## TokenService

```text
generateAccessToken()
verifyAccessToken()
```

## RefreshTokenService

```text
generate()
getExpirationDate()
```

## PasswordService

```text
hashPassword()
comparePassword()
```

---

# Authentication Middleware

```text
authenticateToken()
```

## Authenticated Request

```ts
req.user = {
  userId,
  email,
  sessionId
}
```

---

# Frontend Authentication Flow

```text
Browser Starts
      │
      ▼
Read Access Token
      │
      ▼
useInitializeAuth()
      │
      ▼
GET /auth/me
      │
      ├── Success
      │      │
      │      ▼
      │ Restore User
      │
      └── Failure
             │
             ▼
      Remove Token
             │
             ▼
      Redirect to Login
```

---

# Protected Route Flow

```text
User Navigates
      │
      ▼
ProtectedRoute
      │
      ▼
Initializing?
      │
      ├── Yes
      │      ▼
      │ Loading Screen
      │
      └── No
             │
             ▼
Authenticated?
      │
 ┌────┴─────┐
 │          │
Yes         No
 │          │
 ▼          ▼
Render   Redirect Login
```

---

# Authentication Lifecycle

```text
Application Starts
        │
        ▼
Read Access Token
        │
        ▼
GET /auth/me
        │
 ┌──────┴────────┐
 │               │
Success       Failure
 │               │
 ▼               ▼
Restore User  Remove Token
 │               │
 ▼               ▼
ProtectedRoute Redirect Login
 │
 ▼
Application Ready
```

---

# Frontend Components

```text
AuthProvider
ProtectedRoute
useAuth()
useInitializeAuth()
tokenStorage
apiClient
me.api.ts
```

---

# Authentication State

```text
AuthProvider
├── user
├── token
├── initializing
├── isAuthenticated
├── login()
└── logout()
```

---

# Verified Functionality

## Backend

- ✅ Registration
- ✅ Login
- ✅ BCrypt Password Hashing
- ✅ JWT Generation
- ✅ Persistent Sessions
- ✅ Session-Aware JWT
- ✅ Refresh Tokens
- ✅ Refresh Token Rotation
- ✅ Session Revocation
- ✅ Logout
- ✅ Logout All Sessions
- ✅ Protected Route Authentication

## Frontend

- ✅ Persistent Authentication
- ✅ Automatic User Restoration
- ✅ Protected Routes
- ✅ Shared API Client
- ✅ Token Persistence
- ✅ Authentication Initialization
- ✅ Browser Refresh Persistence

## Security Center

- ✅ Protected Security Dashboard
- ✅ Active Session Viewer
- ✅ Current Device Detection
- ✅ Browser Detection
- ✅ Operating System Detection
- ✅ Session Revocation
- ✅ Logout All Devices
- ✅ Session Expiration Display

## Project

- ✅ TypeScript Typecheck
- ✅ Production Build
- ✅ Repository Pattern
- ✅ Service Layer
- ✅ Enterprise Layered Architecture
- ✅ Database-Backed Sessions

---

# Current Development Status

## Authentication

✅ Complete

## Session Management

✅ Complete

## Security Center

🚧 UI Polish In Progress

---

# Enterprise Security Center Roadmap

## Phase 1 — UI Polish

- Security Overview Dashboard
- Enterprise Session Cards
- Relative Timestamps
- Browser Icons
- Operating System Icons
- Styled Action Buttons
- Better Loading States
- Better Empty States

## Phase 2 — Enterprise Security

- Confirmation Dialogs
- Toast Notifications
- Login History
- Session Activity Timeline
- Device Trust Indicators

## Phase 3 — Account Security

- Change Password
- Password Reset
- Email Verification
- Multi-Factor Authentication (TOTP)

## Phase 4 — Enterprise Identity

- Organizations
- Multi-Tenant Authentication
- Role-Based Access Control (RBAC)
- Permission System

## Phase 5 — Federated Identity

- Google OAuth
- GitHub OAuth
- Microsoft Entra ID
- OpenID Connect (OIDC)
- SAML 2.0

## Phase 6 — Modern Authentication

- Passkeys (WebAuthn)
- Hardware Security Keys
- Device Trust
- Advanced Audit Logging

---

# Summary

CloudSight now provides a production-ready authentication platform built on a layered enterprise architecture.

## Completed Capabilities

- JWT Authentication
- BCrypt Password Hashing
- Refresh Token Rotation
- Persistent Database-Backed Sessions
- Session-Aware JWTs
- Protected React Routes
- Automatic Session Restoration
- Multi-Device Session Management
- Dedicated Security Center
- React Query Authentication Layer
- Repository Pattern Architecture
- Service-Oriented Business Logic
- Prisma ORM
- PostgreSQL

The authentication subsystem follows a strict Controller → Service → Repository architecture and serves as the security foundation for future enterprise capabilities including MFA, RBAC, SSO, passkeys, and organization-based authorization.