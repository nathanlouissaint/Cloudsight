# CloudSight Phase 6 — Repository Design

## Objective

Define the final repository structure, project layout, naming standards, development standards, and documentation rules before implementation begins.

This phase ensures CloudSight is organized like a professional full-stack portfolio project, not a random collection of files.

---

# Repository Strategy

CloudSight uses a monorepo structure.

The repository contains:

* Frontend application
* Backend API
* Database schema and seed data
* Docker configuration
* Terraform placeholder structure
* Documentation
* Mock data
* Scripts
* GitHub workflow placeholders

This is the correct structure for a portfolio project because it keeps the full system easy to review, clone, run, and explain.

---

# Final Repository Structure

```text
cloudsight/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   ├── config/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── budgets/
│   │   │   ├── costs/
│   │   │   ├── dashboard/
│   │   │   ├── forecasts/
│   │   │   └── reports/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── integration/
│   │   └── unit/
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.ts
│
├── infrastructure/
│   ├── docker/
│   │   ├── client.Dockerfile
│   │   └── server.Dockerfile
│   └── terraform/
│       ├── README.md
│       └── main.tf
│
├── docs/
│   ├── requirements/
│   ├── ux/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── repository/
│   └── deployment/
│
├── mock-data/
│   ├── aws-cost-data.csv
│   └── services.json
│
├── scripts/
│   ├── seed-dev-data.sh
│   └── reset-db.sh
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

# Folder Responsibilities

## client/

Contains the React TypeScript frontend.

Responsible for:

* UI rendering
* Routing
* Dashboard pages
* Charts
* Forms
* API calls
* Authentication state

---

## client/src/api/

Contains API client logic.

Examples:

```text
authApi.ts
dashboardApi.ts
costsApi.ts
budgetsApi.ts
forecastApi.ts
reportsApi.ts
```

Rules:

* No raw API calls inside page components
* API functions must be isolated here
* API base URL comes from environment configuration

---

## client/src/components/

Contains reusable UI components.

Subfolders:

```text
charts/
common/
dashboard/
forms/
layout/
```

Rules:

* Reusable components go here
* Page-specific orchestration does not belong here
* Components should be typed with TypeScript interfaces

---

## client/src/features/

Contains domain-specific frontend logic.

Domains:

```text
auth/
budgets/
costs/
dashboard/
forecasts/
reports/
```

Rules:

* Feature-specific components, hooks, and types belong here
* Do not mix unrelated domain logic
* Keep feature boundaries clean

---

## client/src/pages/

Contains route-level page components.

Examples:

```text
LoginPage.tsx
RegisterPage.tsx
DashboardPage.tsx
CostAnalysisPage.tsx
BudgetsPage.tsx
ForecastingPage.tsx
ReportsPage.tsx
SettingsPage.tsx
```

Rules:

* Pages compose features and components
* Pages should not contain raw business logic
* Pages should not call fetch directly

---

## client/src/routes/

Contains frontend routing configuration.

Examples:

```text
AppRoutes.tsx
ProtectedRoute.tsx
```

---

## client/src/types/

Contains shared frontend TypeScript types.

Examples:

```text
auth.types.ts
cost.types.ts
budget.types.ts
forecast.types.ts
report.types.ts
```

---

## server/

Contains the Express TypeScript backend.

Responsible for:

* REST API
* Authentication
* Validation
* Business logic
* Database access
* Error handling
* Testing

---

## server/src/config/

Contains backend configuration.

Examples:

```text
env.ts
database.ts
jwt.ts
```

Rules:

* Environment validation belongs here
* Do not access `process.env` randomly across the app
* Config must fail fast when required variables are missing

---

## server/src/controllers/

Contains HTTP controllers.

Examples:

```text
auth.controller.ts
dashboard.controller.ts
cost.controller.ts
budget.controller.ts
forecast.controller.ts
alert.controller.ts
report.controller.ts
health.controller.ts
```

Rules:

* Controllers handle request and response
* Controllers call services
* Controllers must not contain database queries
* Controllers must not contain business logic

---

## server/src/services/

Contains business logic.

Examples:

```text
auth.service.ts
dashboard.service.ts
cost.service.ts
budget.service.ts
forecast.service.ts
alert.service.ts
report.service.ts
```

Rules:

* Services contain business rules
* Services call repositories
* Services are unit-testable
* Forecasting and anomaly detection logic belongs here

---

## server/src/repositories/

Contains database access logic.

Examples:

```text
user.repository.ts
cost.repository.ts
budget.repository.ts
alert.repository.ts
forecast.repository.ts
report.repository.ts
```

Rules:

* Repositories own Prisma queries
* Repositories do not handle HTTP
* Repositories do not contain presentation logic

---

## server/src/routes/

Contains Express route definitions.

Examples:

```text
auth.routes.ts
dashboard.routes.ts
cost.routes.ts
budget.routes.ts
forecast.routes.ts
alert.routes.ts
report.routes.ts
health.routes.ts
index.ts
```

Rules:

* Routes map endpoints to controllers
* Routes apply middleware
* Routes should remain thin

---

## server/src/middleware/

Contains Express middleware.

Examples:

```text
auth.middleware.ts
error.middleware.ts
validate.middleware.ts
notFound.middleware.ts
```

Rules:

* JWT verification belongs here
* Validation middleware belongs here
* Global error handling belongs here

---

## server/src/validators/

Contains request validation schemas.

Examples:

```text
auth.validator.ts
budget.validator.ts
cost.validator.ts
report.validator.ts
```

Rules:

* Use validation before controller logic
* Keep validation schemas separate from controllers

---

## server/src/types/

Contains backend TypeScript types.

Examples:

```text
express.d.ts
auth.types.ts
api.types.ts
cost.types.ts
```

---

## server/prisma/

Contains Prisma database files.

Files:

```text
schema.prisma
seed.ts
```

Rules:

* Schema must reflect Phase 4 database design
* Seed file must create demo data
* Migrations should be committed

---

## infrastructure/

Contains infrastructure configuration.

### infrastructure/docker/

Contains Dockerfiles.

### infrastructure/terraform/

Contains Terraform placeholder files for future AWS deployment.

Rules:

* Terraform should not be implemented before local app works
* Terraform should document future AWS deployment intent

---

## docs/

Contains all project documentation.

Required sections:

```text
requirements/
ux/
architecture/
database/
api/
repository/
deployment/
```

Rules:

* Docs must stay aligned with implementation
* No stale architecture documents
* Every phase has a clear markdown artifact

---

## mock-data/

Contains local mock cost data.

Files:

```text
aws-cost-data.csv
services.json
```

Rules:

* Mock data should look realistic
* Do not include real AWS billing data
* Data should support charts, forecasts, budgets, and anomalies

---

## scripts/

Contains developer utility scripts.

Examples:

```text
seed-dev-data.sh
reset-db.sh
```

Rules:

* Scripts must be safe for local development
* Destructive scripts should be clearly named

---

## .github/workflows/

Contains CI workflow configuration.

Initial CI should eventually run:

* Backend tests
* Frontend build
* Type checks
* Lint checks

---

# Naming Standards

## Files

Use kebab-case for most files:

```text
auth-service.ts
budget-controller.ts
cost-repository.ts
```

Use PascalCase for React components:

```text
DashboardPage.tsx
BudgetUsageCard.tsx
SpendTrendChart.tsx
```

Use `.types.ts` for type files:

```text
cost.types.ts
budget.types.ts
```

Use `.validator.ts` for validation files:

```text
auth.validator.ts
budget.validator.ts
```

---

# TypeScript Standards

## General Rules

* No implicit `any`
* Prefer explicit return types for exported functions
* Use interfaces for object contracts
* Use type aliases for unions
* Avoid overly clever abstractions
* Keep functions small
* Keep files focused

---

# Backend Standards

## Controller Pattern

```text
Request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Rules:

* Controllers do not query Prisma directly
* Services do not use Express `req` or `res`
* Repositories do not know HTTP exists

---

# Frontend Standards

## Page Pattern

```text
Page
    ↓
Feature Hook / API Function
    ↓
Component
```

Rules:

* Pages compose UI
* Components display UI
* API calls are isolated
* Types are shared across feature modules where appropriate

---

# Environment Standards

Use a root `.env.example`.

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cloudsight"
JWT_SECRET="replace-me"
JWT_EXPIRES_IN="1d"
PORT=4000
CLIENT_URL="http://localhost:5173"
VITE_API_BASE_URL="http://localhost:4000/api/v1"
```

Rules:

* Never commit `.env`
* Always commit `.env.example`
* Validate env variables on server startup

---

# Git Standards

## Branching

Default branch:

```text
main
```

Feature branches:

```text
feature/backend-auth
feature/frontend-dashboard
feature/docker-setup
```

---

## Commit Messages

Use conventional commit style:

```text
docs: add phase 6 repository design
feat: add authentication api
fix: correct budget status calculation
test: add forecast service tests
chore: configure docker compose
```

---

# README Standards

The root README should eventually include:

* Project overview
* Architecture summary
* Tech stack
* Features
* Setup instructions
* Environment variables
* Docker instructions
* Screenshots
* API documentation link
* Database documentation link
* Future AWS architecture
* Interview talking points

---

# Development Workflow

Recommended build sequence:

```text
1. Repository structure
2. Docker setup
3. Backend scaffold
4. Database schema
5. Seed data
6. Auth API
7. Cost APIs
8. Budget APIs
9. Forecast APIs
10. Report APIs
11. Frontend scaffold
12. Dashboard UI
13. Charts
14. Testing
15. Final documentation
```

Do not build UI before backend contracts and database schema exist.

---

# Required Files for Phase 6

Create:

```text
cloudsight/docs/repository/PHASE_6_REPOSITORY_DESIGN.md
```

No source code is required yet.

---

# Testing Instructions

Phase 6 is documentation-only.

Run:

```bash
ls cloudsight/docs/repository
```

Expected output:

```text
PHASE_6_REPOSITORY_DESIGN.md
```

---

# Validation Checklist

Phase 6 is complete when:

* [ ] Repository structure is documented
* [ ] Folder responsibilities are documented
* [ ] Naming standards are documented
* [ ] Backend standards are documented
* [ ] Frontend standards are documented
* [ ] Environment standards are documented
* [ ] Git standards are documented
* [ ] Development workflow is documented
* [ ] Document is committed to GitHub

---

# Risks

## Risk 1: Folder Sprawl

Too many folders can create fake complexity.

### Mitigation

Each folder must have a clear responsibility.

---

## Risk 2: Architecture Drift

Implementation may diverge from documentation.

### Mitigation

Update docs whenever implementation decisions change.

---

## Risk 3: Mixed Responsibilities

Putting API calls, UI logic, and business logic in the same files will make the project look amateur.

### Mitigation

Maintain clear frontend and backend boundaries.

---

## Risk 4: Overbuilding Before Running Locally

Terraform and CI/CD are useful, but the local app must work first.

### Mitigation

Prioritize Docker Compose and local execution before AWS deployment.

---

# Future Enhancements

Future repository improvements may include:

* Shared TypeScript package
* OpenAPI-generated API client
* Storybook
* GitHub Actions CI
* Terraform AWS module structure
* Deployment scripts
* Playwright end-to-end tests

---

# Phase 6 Completion Criteria

Phase 6 is complete when the repository design document exists, is reviewed, and is committed.

Commit:

```bash
git add .
git commit -m "docs: add phase 6 repository design"
git push origin main
```
