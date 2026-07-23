# CloudSight Authentication Current State

**Version:** 1.5.0-alpha

**Branch:**
```
feature/auth-enterprise-sessions
```

---

# Authentication Architecture

CloudSight follows a strict layered architecture.

```
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

Business rules never live inside controllers.

Repositories are the only layer allowed to communicate with Prisma.

---

# Authentication Features

## Local Authentication

- ✅ User Registration
- ✅ Email/Password Login
- ✅ BCrypt Password Hashing
- ✅ Password Verification
- ✅ JWT Access Tokens
- ✅ Refresh Tokens
- ✅ Persistent Sessions
- ✅ Logout
- ✅ Logout All Sessions

---

## JWT Authentication

Algorithm

```
HS256
```

Current JWT Payload

```json
{
  "userId": "...",
  "email": "...",
  "sessionId": "...",
  "iat": "...",
  "exp": "..."
}
```

Access Token Lifetime

```
15 Minutes
```

Refresh Token Lifetime

```
30 Days
```

Refresh tokens are cryptographically secure random values generated using Node's crypto module.

---

# Session Management

Every successful login creates a database-backed session.

Current Session Model

```
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

Current capabilities

- ✅ Create Session
- ✅ Validate Refresh Token
- ✅ Refresh Session
- ✅ Rotate Refresh Token
- ✅ Touch Session
- ✅ Revoke Session
- ✅ Revoke All Sessions
- ✅ Delete Expired Sessions

---

# Session-Aware JWT

Each access token now contains the originating database session.

Example

```json
{
  "userId": "...",
  "email": "...",
  "sessionId": "89a46f7c-8585-445d-ae76-b07912e49540",
  "iat": 1784773679,
  "exp": 1784774579
}
```

Benefits

- Identify current device
- Device-aware authorization
- Logout specific session
- Logout all other sessions
- Audit logging
- Refresh token reuse detection
- MFA foundation
- Passkey foundation

---

# API Endpoints

## Public

```
POST /auth/register

POST /auth/login

POST /auth/refresh
```

---

## Protected

```
GET /auth/me

GET /auth/sessions

POST /auth/logout

POST /auth/logout-all

DELETE /auth/sessions/:sessionId
```

---

# Repository Layer

```
UserRepository

findByEmail()

findById()

create()
```

```
SessionRepository

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

```
AuthService

registerUser()

loginUser()

getCurrentUser()

logoutUser()
```

```
SessionService

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

```
TokenService

generateAccessToken()

verifyAccessToken()
```

```
RefreshTokenService

generate()

getExpirationDate()
```

```
PasswordService

hashPassword()

comparePassword()
```

---

# Authentication Middleware

```
authenticateToken()
```

Authenticated Request

```ts
req.user = {
    userId,
    email,
    sessionId
}
```

---

# Verified Functionality

Verified

- ✅ Registration
- ✅ Login
- ✅ Password Hashing
- ✅ JWT Generation
- ✅ Session Creation
- ✅ Session-Aware JWT
- ✅ Refresh Tokens
- ✅ Session Rotation
- ✅ Logout
- ✅ Logout All Sessions
- ✅ JWT Decoding
- ✅ Protected Route Authentication
- ✅ TypeScript Typecheck
- ✅ Production Build

---

# Current Authentication Status

Completed

- ✅ Local Authentication
- ✅ JWT Authentication
- ✅ Refresh Tokens
- ✅ Persistent Sessions
- ✅ Session-Aware JWT
- ✅ Repository Pattern
- ✅ Layered Architecture

---

# Next Milestone

## Current Session Awareness

Use the `sessionId` stored inside the JWT to identify the active session returned by `GET /auth/sessions`.

Current

```json
{
    "isCurrent": false
}
```

Target

```json
{
    "isCurrent": true
}
```

This enables:

- Current device indicator
- Logout other devices
- Enterprise session management
- Security dashboard
- Audit history