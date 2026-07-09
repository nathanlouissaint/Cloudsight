# CloudSight Phase 4 — Database Design

## Objective

Define the CloudSight database design before backend development begins.

This phase documents the relational data model, table responsibilities, relationships, indexes, and design decisions for the MVP.

CloudSight uses PostgreSQL for the MVP because the portfolio version needs clear relational modeling for users, cost records, budgets, alerts, forecasts, and reports.

---

# Database Architecture

CloudSight MVP uses:

```text
Express API
    ↓
Prisma ORM
    ↓
PostgreSQL
```

PostgreSQL is the system of record for:

* Users
* Cloud services
* Cost records
* Budgets
* Alerts
* Forecasts
* Executive reports

The uploaded AWS architecture references DynamoDB for production-style operational views, but PostgreSQL is the correct MVP choice because it gives stronger relational modeling and easier local development.

---

# Core Entities

CloudSight requires these core entities:

```text
User
CloudService
CostRecord
Budget
Alert
Forecast
Report
```

---

# Entity Relationship Diagram

```text
User
 ├── Budgets
 ├── Alerts
 ├── Forecasts
 └── Reports

CloudService
 └── CostRecords

CostRecord
 └── belongs to CloudService

Budget
 └── belongs to User

Alert
 ├── belongs to User
 └── optionally belongs to CloudService

Forecast
 └── belongs to User

Report
 └── belongs to User
```

---

# ERD

```text
+----------------+
| users          |
+----------------+
| id             |
| name           |
| email          |
| password_hash  |
| created_at     |
| updated_at     |
+--------+-------+
         |
         | 1:N
         |
+--------v-------+
| budgets        |
+----------------+
| id             |
| user_id        |
| name           |
| amount         |
| period         |
| start_date     |
| end_date       |
| created_at     |
| updated_at     |
+----------------+

+----------------+
| cloud_services |
+----------------+
| id             |
| name           |
| category       |
| provider       |
| created_at     |
| updated_at     |
+--------+-------+
         |
         | 1:N
         |
+--------v-------+
| cost_records   |
+----------------+
| id             |
| service_id     |
| usage_date     |
| amount         |
| currency       |
| account_name   |
| region         |
| created_at     |
| updated_at     |
+----------------+

+----------------+
| alerts         |
+----------------+
| id             |
| user_id        |
| service_id     |
| type           |
| severity       |
| title          |
| description    |
| detected_at    |
| created_at     |
| updated_at     |
+----------------+

+----------------+
| forecasts      |
+----------------+
| id             |
| user_id        |
| forecast_month |
| projected_spend|
| method         |
| created_at     |
| updated_at     |
+----------------+

+----------------+
| reports        |
+----------------+
| id             |
| user_id        |
| report_month   |
| title          |
| summary        |
| highlights     |
| recommendations|
| created_at     |
| updated_at     |
+----------------+
```

---

# Table Design

## users

Stores application users.

### Columns

| Column        |         Type | Required | Notes                  |
| ------------- | -----------: | -------: | ---------------------- |
| id            |         UUID |      Yes | Primary key            |
| name          | VARCHAR(120) |      Yes | User display name      |
| email         | VARCHAR(255) |      Yes | Unique login email     |
| password_hash |         TEXT |      Yes | bcrypt hashed password |
| created_at    |    TIMESTAMP |      Yes | Created timestamp      |
| updated_at    |    TIMESTAMP |      Yes | Updated timestamp      |

### Indexes

```sql
CREATE UNIQUE INDEX users_email_idx ON users(email);
```

---

## cloud_services

Stores AWS-like services used in mock billing data.

Examples:

* Amazon EC2
* Amazon S3
* AWS Lambda
* Amazon RDS
* Amazon CloudWatch
* Amazon DynamoDB

### Columns

| Column     |         Type | Required | Notes                                              |
| ---------- | -----------: | -------: | -------------------------------------------------- |
| id         |         UUID |      Yes | Primary key                                        |
| name       | VARCHAR(150) |      Yes | Service name                                       |
| category   | VARCHAR(100) |      Yes | Compute, Storage, Database, Monitoring, Networking |
| provider   |  VARCHAR(50) |      Yes | Default: AWS                                       |
| created_at |    TIMESTAMP |      Yes | Created timestamp                                  |
| updated_at |    TIMESTAMP |      Yes | Updated timestamp                                  |

### Indexes

```sql
CREATE UNIQUE INDEX cloud_services_name_idx ON cloud_services(name);
CREATE INDEX cloud_services_category_idx ON cloud_services(category);
```

---

## cost_records

Stores daily cloud cost records.

### Columns

| Column       |          Type | Required | Notes                         |
| ------------ | ------------: | -------: | ----------------------------- |
| id           |          UUID |      Yes | Primary key                   |
| service_id   |          UUID |      Yes | Foreign key to cloud_services |
| usage_date   |          DATE |      Yes | Billing usage date            |
| amount       | DECIMAL(12,2) |      Yes | Daily spend amount            |
| currency     |   VARCHAR(10) |      Yes | Default: USD                  |
| account_name |  VARCHAR(120) |       No | Mock AWS account name         |
| region       |   VARCHAR(80) |       No | Mock AWS region               |
| created_at   |     TIMESTAMP |      Yes | Created timestamp             |
| updated_at   |     TIMESTAMP |      Yes | Updated timestamp             |

### Indexes

```sql
CREATE INDEX cost_records_usage_date_idx ON cost_records(usage_date);
CREATE INDEX cost_records_service_id_idx ON cost_records(service_id);
CREATE INDEX cost_records_service_date_idx ON cost_records(service_id, usage_date);
```

### Reasoning

Cost records will be queried heavily by date range and service. These indexes support dashboard metrics, trend charts, service breakdowns, and anomaly detection.

---

## budgets

Stores user-defined monthly budgets.

### Columns

| Column     |          Type | Required | Notes                |
| ---------- | ------------: | -------: | -------------------- |
| id         |          UUID |      Yes | Primary key          |
| user_id    |          UUID |      Yes | Foreign key to users |
| name       |  VARCHAR(150) |      Yes | Budget name          |
| amount     | DECIMAL(12,2) |      Yes | Budget limit         |
| period     |   VARCHAR(50) |      Yes | Monthly for MVP      |
| start_date |          DATE |      Yes | Budget start         |
| end_date   |          DATE |      Yes | Budget end           |
| created_at |     TIMESTAMP |      Yes | Created timestamp    |
| updated_at |     TIMESTAMP |      Yes | Updated timestamp    |

### Indexes

```sql
CREATE INDEX budgets_user_id_idx ON budgets(user_id);
CREATE INDEX budgets_date_range_idx ON budgets(start_date, end_date);
```

---

## alerts

Stores generated cost alerts.

### Alert Types

* SPEND_SPIKE
* BUDGET_WARNING
* BUDGET_EXCEEDED

### Severities

* LOW
* MEDIUM
* HIGH

### Columns

| Column      |         Type | Required | Notes                      |
| ----------- | -----------: | -------: | -------------------------- |
| id          |         UUID |      Yes | Primary key                |
| user_id     |         UUID |      Yes | Foreign key to users       |
| service_id  |         UUID |       No | Optional service reference |
| type        |  VARCHAR(80) |      Yes | Alert type                 |
| severity    |  VARCHAR(50) |      Yes | Alert severity             |
| title       | VARCHAR(200) |      Yes | Alert title                |
| description |         TEXT |      Yes | Alert explanation          |
| detected_at |    TIMESTAMP |      Yes | Detection time             |
| created_at  |    TIMESTAMP |      Yes | Created timestamp          |
| updated_at  |    TIMESTAMP |      Yes | Updated timestamp          |

### Indexes

```sql
CREATE INDEX alerts_user_id_idx ON alerts(user_id);
CREATE INDEX alerts_detected_at_idx ON alerts(detected_at);
CREATE INDEX alerts_type_idx ON alerts(type);
CREATE INDEX alerts_severity_idx ON alerts(severity);
```

---

## forecasts

Stores generated forecast snapshots.

### Columns

| Column          |          Type | Required | Notes                   |
| --------------- | ------------: | -------: | ----------------------- |
| id              |          UUID |      Yes | Primary key             |
| user_id         |          UUID |      Yes | Foreign key to users    |
| forecast_month  |          DATE |      Yes | Month being forecasted  |
| projected_spend | DECIMAL(12,2) |      Yes | End-of-month projection |
| method          |  VARCHAR(100) |      Yes | moving_average for MVP  |
| created_at      |     TIMESTAMP |      Yes | Created timestamp       |
| updated_at      |     TIMESTAMP |      Yes | Updated timestamp       |

### Indexes

```sql
CREATE INDEX forecasts_user_id_idx ON forecasts(user_id);
CREATE INDEX forecasts_month_idx ON forecasts(forecast_month);
CREATE INDEX forecasts_user_month_idx ON forecasts(user_id, forecast_month);
```

---

## reports

Stores generated monthly executive reports.

### Columns

| Column          |         Type | Required | Notes                    |
| --------------- | -----------: | -------: | ------------------------ |
| id              |         UUID |      Yes | Primary key              |
| user_id         |         UUID |      Yes | Foreign key to users     |
| report_month    |         DATE |      Yes | Reporting month          |
| title           | VARCHAR(200) |      Yes | Report title             |
| summary         |         TEXT |      Yes | Executive summary        |
| highlights      |        JSONB |      Yes | Cost highlights          |
| recommendations |        JSONB |      Yes | Optimization suggestions |
| created_at      |    TIMESTAMP |      Yes | Created timestamp        |
| updated_at      |    TIMESTAMP |      Yes | Updated timestamp        |

### Indexes

```sql
CREATE INDEX reports_user_id_idx ON reports(user_id);
CREATE INDEX reports_month_idx ON reports(report_month);
CREATE INDEX reports_user_month_idx ON reports(user_id, report_month);
```

---

# Relationships

## users to budgets

One user can have many budgets.

```text
users.id → budgets.user_id
```

---

## users to alerts

One user can have many alerts.

```text
users.id → alerts.user_id
```

---

## users to forecasts

One user can have many forecasts.

```text
users.id → forecasts.user_id
```

---

## users to reports

One user can have many reports.

```text
users.id → reports.user_id
```

---

## cloud_services to cost_records

One cloud service can have many cost records.

```text
cloud_services.id → cost_records.service_id
```

---

## cloud_services to alerts

One cloud service can optionally have many alerts.

```text
cloud_services.id → alerts.service_id
```

---

# Prisma Model Draft

```prisma
model User {
  id           String     @id @default(uuid())
  name         String
  email        String     @unique
  passwordHash String     @map("password_hash")
  budgets      Budget[]
  alerts       Alert[]
  forecasts    Forecast[]
  reports      Report[]
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  @@map("users")
}

model CloudService {
  id          String       @id @default(uuid())
  name        String       @unique
  category    String
  provider    String       @default("AWS")
  costRecords CostRecord[]
  alerts      Alert[]
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@map("cloud_services")
}

model CostRecord {
  id          String       @id @default(uuid())
  serviceId   String       @map("service_id")
  service     CloudService @relation(fields: [serviceId], references: [id])
  usageDate   DateTime     @map("usage_date") @db.Date
  amount      Decimal      @db.Decimal(12, 2)
  currency    String       @default("USD")
  accountName String?      @map("account_name")
  region      String?
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@index([usageDate])
  @@index([serviceId])
  @@index([serviceId, usageDate])
  @@map("cost_records")
}

model Budget {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  name      String
  amount    Decimal  @db.Decimal(12, 2)
  period    String   @default("MONTHLY")
  startDate DateTime @map("start_date") @db.Date
  endDate   DateTime @map("end_date") @db.Date
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([startDate, endDate])
  @@map("budgets")
}

model Alert {
  id          String        @id @default(uuid())
  userId      String        @map("user_id")
  user        User          @relation(fields: [userId], references: [id])
  serviceId   String?       @map("service_id")
  service     CloudService? @relation(fields: [serviceId], references: [id])
  type        String
  severity    String
  title       String
  description String
  detectedAt  DateTime      @map("detected_at")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@index([userId])
  @@index([detectedAt])
  @@index([type])
  @@index([severity])
  @@map("alerts")
}

model Forecast {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  user           User     @relation(fields: [userId], references: [id])
  forecastMonth  DateTime @map("forecast_month") @db.Date
  projectedSpend Decimal  @map("projected_spend") @db.Decimal(12, 2)
  method         String   @default("moving_average")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([forecastMonth])
  @@index([userId, forecastMonth])
  @@map("forecasts")
}

model Report {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id])
  reportMonth     DateTime @map("report_month") @db.Date
  title           String
  summary         String
  highlights      Json
  recommendations Json
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([reportMonth])
  @@index([userId, reportMonth])
  @@map("reports")
}
```

---

# Data Design Decisions

## Decision 1: Use PostgreSQL

### Reason

The MVP has relational data and needs clear joins across users, budgets, cost records, alerts, forecasts, and reports.

### Tradeoff

This differs from the future AWS DynamoDB reference design, but it improves MVP delivery speed.

---

## Decision 2: Store Cost Records by Service and Date

### Reason

Most dashboard queries depend on date ranges and service breakdowns.

### Tradeoff

This is simpler than modeling every AWS billing dimension.

---

## Decision 3: Store Reports in Database

### Reason

Reports should be viewable after generation.

### Tradeoff

Future versions may store report exports in S3.

---

## Decision 4: Store Alerts as Generated Records

### Reason

Users should be able to review anomaly history.

### Tradeoff

Some alerts may be recalculated in future versions.

---

## Decision 5: Keep User Model Simple

### Reason

No role-based permissions are required for the MVP.

### Tradeoff

Future RBAC would require additional tables.

---

# Mock Data Requirements

Seed data should include:

* One demo user
* Six to eight AWS-like cloud services
* At least 90 days of daily cost records
* One active monthly budget
* Several generated alerts
* One forecast
* One executive report

Example services:

```text
Amazon EC2
Amazon S3
AWS Lambda
Amazon RDS
Amazon CloudWatch
Amazon DynamoDB
Amazon VPC
AWS Support
```

---

# Query Requirements

The database must support:

* Current month spend
* Previous month spend
* Daily spend trends
* Monthly spend trends
* Spend by service
* Top cost drivers
* Budget usage
* Forecasting inputs
* Alert history
* Executive report retrieval

---

# Validation Checklist

Phase 4 is complete when:

* [ ] Database entities are defined
* [ ] ERD is documented
* [ ] Tables are documented
* [ ] Relationships are documented
* [ ] Indexes are documented
* [ ] Prisma model draft is documented
* [ ] Mock data requirements are documented
* [ ] Database design is committed to GitHub

---

# Risks

## Risk 1: Over-modeling AWS Billing

AWS billing data is extremely detailed. Modeling every AWS billing field would slow delivery.

### Mitigation

Track only fields needed for dashboard, trends, budgets, forecasts, and alerts.

---

## Risk 2: Weak Query Performance

Cost trend charts depend heavily on date range queries.

### Mitigation

Index cost records by date and service.

---

## Risk 3: Premature Multi-Tenancy

Adding organizations, teams, roles, and permissions now increases complexity.

### Mitigation

Use a simple user-owned model first.

---

## Risk 4: Report Storage Bloat

Large generated reports may grow over time.

### Mitigation

Keep report content concise and use JSON only for structured highlights and recommendations.

---

# Future Enhancements

Future database additions may include:

* Organizations
* Accounts
* Teams
* Roles
* CSV upload jobs
* AWS integration credentials
* Cost categories
* Tags
* Regions
* S3 report export metadata
* Notification preferences
* Audit logs

---

# Testing Instructions

No database migration is required in Phase 4.

Validation is documentation-based.

Run:

```bash
ls cloudsight/docs/database
```

Expected output:

```text
PHASE_4_DATABASE_DESIGN.md
```

Review file contents:

```bash
cat cloudsight/docs/database/PHASE_4_DATABASE_DESIGN.md
```

---

# Phase 4 Completion Criteria

Phase 4 is complete when this document exists, is reviewed, and is committed.

Commit:

```bash
git add .
git commit -m "docs: add phase 4 database design"
git push origin main
```
