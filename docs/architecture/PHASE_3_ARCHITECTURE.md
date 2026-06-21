# CloudSight Phase 3 — Architecture Design

## Objective

Define the CloudSight system architecture before database, API, backend, and frontend implementation begins.

This phase translates the full AWS reference architecture into a simplified portfolio MVP architecture.

The source system design describes a production-grade FinOps platform using React, API Gateway, Step Functions, Lambda, DynamoDB, S3, CloudWatch, SNS, IAM, KMS, Cost Explorer, Budgets, Organizations, Trusted Advisor, and Bedrock.

For the MVP, CloudSight will implement the same product concepts using a simpler local architecture:

```text
React Dashboard
    ↓
Express API
    ↓
PostgreSQL
```

The MVP must stay simple, working, and interview-ready.

---

# Architecture Principles

CloudSight architecture follows these principles:

1. Keep the MVP simple.
2. Preserve the AWS architecture story.
3. Avoid enterprise complexity.
4. Build a complete working product first.
5. Use clean boundaries between frontend, backend, and data.
6. Make future AWS integrations obvious.
7. Document every architectural tradeoff.

---

# Source Architecture Alignment

The uploaded system design describes CloudSight as a production-grade cost visibility and FinOps platform with:

* React dashboard
* REST API layer
* Scheduled workflows
* Cost collection
* Forecasting
* Alerting
* Executive reporting
* AWS billing sources
* Monitoring
* Security controls

The MVP will keep these same functional domains but implement them through a local full-stack architecture.

---

# MVP System Architecture

```text
+-------------------------+
|      React Client       |
| TypeScript + MUI        |
| Recharts Dashboard      |
+-----------+-------------+
            |
            | HTTPS / REST JSON
            |
+-----------v-------------+
|      Express API        |
| Node.js + TypeScript    |
| Auth / Costs / Budgets  |
| Forecasts / Reports     |
+-----------+-------------+
            |
            | Prisma ORM
            |
+-----------v-------------+
|      PostgreSQL         |
| Users                   |
| Cost Records            |
| Budgets                 |
| Alerts                  |
| Reports                 |
+-------------------------+
```

---

# High-Level Component Diagram

```text
User
 ↓
React Dashboard
 ↓
Express REST API
 ↓
Service Layer
 ↓
Repository Layer
 ↓
PostgreSQL
```

## Component Responsibilities

### React Dashboard

Responsible for:

* Login and registration screens
* Dashboard layout
* Charts and visualizations
* Cost trend views
* Budget views
* Forecast views
* Report views

Technology:

* React
* TypeScript
* Material UI
* Recharts

---

### Express API

Responsible for:

* Authentication
* JWT validation
* Request validation
* REST endpoints
* Business logic orchestration
* Error handling

Technology:

* Node.js
* Express
* TypeScript
* JWT
* bcrypt
* Zod or similar validation library

---

### Service Layer

Responsible for:

* Cost calculations
* Forecast logic
* Budget status logic
* Anomaly detection
* Executive report generation

Examples:

* `CostService`
* `BudgetService`
* `ForecastService`
* `AlertService`
* `ReportService`

---

### Repository Layer

Responsible for:

* Database reads
* Database writes
* Query isolation
* Prisma model access

Examples:

* `UserRepository`
* `CostRepository`
* `BudgetRepository`
* `AlertRepository`
* `ReportRepository`

---

### PostgreSQL

Responsible for storing:

* Users
* Cost records
* Services
* Budgets
* Alerts
* Reports

---

# Data Flow Diagram

## Dashboard Summary Flow

```text
User opens Dashboard
    ↓
React requests /api/dashboard/summary
    ↓
Express validates JWT
    ↓
Dashboard controller calls CostService
    ↓
CostService queries cost records and budgets
    ↓
PostgreSQL returns data
    ↓
Service calculates summary metrics
    ↓
API returns JSON
    ↓
React renders KPI cards and charts
```

---

## Forecasting Flow

```text
User opens Forecasting page
    ↓
React requests /api/forecast
    ↓
Express validates JWT
    ↓
ForecastService loads recent cost data
    ↓
ForecastService calculates moving average
    ↓
ForecastService projects month-end spend
    ↓
API returns forecast response
    ↓
React renders forecast chart and summary
```

---

## Budget Monitoring Flow

```text
User creates budget
    ↓
React sends POST /api/budgets
    ↓
Express validates JWT and request body
    ↓
BudgetService creates budget
    ↓
PostgreSQL stores budget
    ↓
BudgetService compares current spend to budget
    ↓
API returns updated budget status
    ↓
React updates budget page
```

---

## Anomaly Detection Flow

```text
User opens Alerts page or Dashboard
    ↓
React requests /api/alerts
    ↓
Express validates JWT
    ↓
AlertService loads cost records
    ↓
AlertService detects spend spikes and budget breaches
    ↓
Alerts returned to frontend
    ↓
React displays recent alerts
```

---

## Executive Report Flow

```text
User clicks Generate Report
    ↓
React sends POST /api/reports/generate
    ↓
Express validates JWT
    ↓
ReportService gathers costs, budgets, forecasts, alerts
    ↓
ReportService generates template-based report
    ↓
PostgreSQL stores report
    ↓
API returns report
    ↓
React displays monthly summary
```

---

# Deployment Architecture

## Local MVP Deployment

```text
Docker Compose
│
├── client container
│   └── React application
│
├── server container
│   └── Express API
│
└── postgres container
    └── PostgreSQL database
```

---

# Local Deployment Diagram

```text
Browser
  |
  | http://localhost:5173
  ↓
React Client Container
  |
  | http://server:4000/api
  ↓
Express API Container
  |
  | postgresql://postgres:5432/cloudsight
  ↓
PostgreSQL Container
```

---

# Future AWS Deployment Architecture

The production-style AWS architecture can be added later as a portfolio extension.

```text
React Static App
    ↓
Amazon CloudFront / S3 or Amplify
    ↓
Amazon API Gateway
    ↓
AWS Lambda Services
    ↓
Amazon DynamoDB or RDS
    ↓
CloudWatch / SNS / S3 / IAM / KMS
```

Future AWS integrations may include:

* AWS Cost Explorer
* AWS Budgets
* AWS Organizations
* Trusted Advisor
* EventBridge
* Step Functions
* Lambda
* S3
* CloudWatch
* SNS
* KMS
* Secrets Manager
* Bedrock

These are documented as future-state architecture and should not block the MVP.

---

# Architecture Decisions

## Decision 1: Monolithic Backend API

### Decision

Use one Express API instead of microservices.

### Reason

The MVP does not need distributed services. A monolithic API is easier to build, test, document, and explain.

### Tradeoff

Less scalable than microservices, but faster and cleaner for a portfolio project.

---

## Decision 2: PostgreSQL Instead of DynamoDB

### Decision

Use PostgreSQL for the MVP.

### Reason

PostgreSQL is easier for relational data such as users, budgets, cost records, alerts, and reports.

### Tradeoff

The uploaded AWS reference architecture uses DynamoDB, but PostgreSQL is better for local development and portfolio clarity.

---

## Decision 3: Mock Billing Data First

### Decision

Use seeded mock AWS billing data.

### Reason

No AWS credentials are available, and fake live integrations create unnecessary complexity.

### Tradeoff

The MVP will not show real AWS spend, but the architecture leaves room for future AWS Cost Explorer integration.

---

## Decision 4: Template-Based Reports

### Decision

Use deterministic template-based executive reports.

### Reason

AI summaries are optional and should not be added before core reporting works.

### Tradeoff

Reports will be less dynamic than AI-generated reports but easier to test and explain.

---

## Decision 5: Simple Statistical Anomaly Detection

### Decision

Use basic rules for anomaly detection.

Examples:

* Daily spend exceeds 150% of 7-day average
* Budget usage exceeds 80%
* Budget usage exceeds 100%

### Reason

Simple rules are transparent and interview-friendly.

### Tradeoff

Less advanced than machine learning, but more practical for the MVP.

---

# Technical Decisions

## Frontend

* React
* TypeScript
* Material UI
* Recharts
* React Router
* Axios or Fetch API

## Backend

* Node.js
* Express
* TypeScript
* JWT authentication
* bcrypt password hashing
* Prisma ORM
* Zod validation
* Jest
* Supertest

## Database

* PostgreSQL
* Prisma migrations
* Seed data for mock AWS cost records

## DevOps

* Docker
* Docker Compose
* `.env` configuration
* Future Terraform folder

---

# Security Architecture

## MVP Security Controls

CloudSight MVP includes:

* Password hashing with bcrypt
* JWT authentication
* Protected API routes
* Environment variables for secrets
* Request validation
* Centralized error handling
* No secrets committed to Git

---

## Future AWS Security Controls

Future AWS deployment should include:

* IAM least privilege
* KMS encryption
* Secrets Manager
* HTTPS-only traffic
* CloudWatch logging
* S3 encryption
* API Gateway authorization

---

# Observability Architecture

## MVP Observability

The MVP will include:

* API health endpoint
* Structured server logs
* Error middleware
* Request status codes
* Docker container logs

## Future Observability

Future AWS deployment may include:

* CloudWatch Logs
* CloudWatch Metrics
* CloudWatch Alarms
* SNS notifications
* Cost anomaly notification workflows

---

# Folder Structure

```text
cloudsight/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── tests/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   └── prisma/
│
├── infrastructure/
│   ├── docker/
│   └── terraform/
│
├── docs/
│   ├── requirements/
│   ├── ux/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── deployment/
│
├── mock-data/
├── scripts/
├── .github/
└── README.md
```

---

# Required Architecture Files

For Phase 3, create:

```text
cloudsight/docs/architecture/PHASE_3_ARCHITECTURE.md
```

Optional later files:

```text
cloudsight/docs/architecture/SYSTEM_ARCHITECTURE.md
cloudsight/docs/architecture/COMPONENT_DIAGRAM.md
cloudsight/docs/architecture/DATA_FLOW.md
cloudsight/docs/architecture/DEPLOYMENT_ARCHITECTURE.md
```

For now, one consolidated Phase 3 document is enough.

---

# Testing Instructions

No application tests are required in Phase 3.

Validation is documentation-based.

Run:

```bash
ls cloudsight/docs/architecture
```

Expected output:

```text
PHASE_3_ARCHITECTURE.md
```

Check the file:

```bash
cat cloudsight/docs/architecture/PHASE_3_ARCHITECTURE.md
```

---

# Validation Checklist

Phase 3 is complete when:

* [ ] System architecture is documented
* [ ] Component responsibilities are documented
* [ ] Data flow is documented
* [ ] Deployment architecture is documented
* [ ] Architecture decisions are documented
* [ ] MVP architecture is clearly separated from future AWS architecture
* [ ] No unnecessary enterprise architecture is added
* [ ] File is committed to GitHub

---

# Risks

## Risk 1: Overbuilding

The AWS reference architecture includes many services. Building all of them now would kill execution speed.

### Mitigation

Keep AWS services documented as future-state only.

---

## Risk 2: Weak Portfolio Story

If the MVP ignores the AWS architecture completely, it will look like a generic dashboard.

### Mitigation

Keep AWS concepts in the documentation and data model while implementing a simple local version.

---

## Risk 3: Poor Separation of Concerns

Putting calculations directly inside controllers will make the backend harder to test.

### Mitigation

Use controllers for HTTP handling, services for business logic, and repositories for database access.

---

## Risk 4: Fake AI Complexity

Adding AI before deterministic reporting works creates unnecessary risk.

### Mitigation

Use template-based reports first. Add AI later only after the core system works.

---

# Future Enhancements

Future versions may add:

* AWS Cost Explorer integration
* AWS Budgets integration
* AWS Organizations account mapping
* Trusted Advisor recommendations
* Terraform AWS deployment
* GitHub Actions CI/CD
* S3 report archive
* CloudWatch metrics
* SNS email alerts
* Bedrock or OpenAI executive summaries
* CSV upload pipeline
* Multi-account reporting

---

# Phase 3 Completion Criteria

Phase 3 is complete when this file exists, is reviewed, and is committed.

Commit:

```bash
git add .
git commit -m "docs: add phase 3 architecture design"
git push origin main
```
