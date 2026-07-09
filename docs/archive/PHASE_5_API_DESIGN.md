# CloudSight Phase 5 — API Design

## Objective

Design a complete REST API for CloudSight.

The API must support:

* Authentication
* Dashboard metrics
* Cost analysis
* Budget management
* Forecasting
* Anomaly detection
* Executive reporting

The API should be:

* RESTful
* Predictable
* Versionable
* Easy to test
* Easy to explain in interviews

Base URL:

```text
/api/v1
```

---

# API Architecture

```text
React Client
     ↓
Express Routes
     ↓
Controllers
     ↓
Services
     ↓
Repositories
     ↓
PostgreSQL
```

---

# Authentication Endpoints

## Register User

### Endpoint

```http
POST /api/v1/auth/register
```

### Request Body

```json
{
  "name": "Nathan Louissaint",
  "email": "nate@example.com",
  "password": "Password123!"
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Status Codes

```text
201 Created
400 Bad Request
409 Conflict
500 Internal Server Error
```

---

## Login User

### Endpoint

```http
POST /api/v1/auth/login
```

### Request Body

```json
{
  "email": "nate@example.com",
  "password": "Password123!"
}
```

### Success Response

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "Nathan Louissaint",
    "email": "nate@example.com"
  }
}
```

### Status Codes

```text
200 OK
401 Unauthorized
500 Internal Server Error
```

---

# Dashboard Endpoints

## Dashboard Summary

### Endpoint

```http
GET /api/v1/dashboard/summary
```

### Headers

```http
Authorization: Bearer <token>
```

### Response

```json
{
  "currentMonthSpend": 4823.55,
  "previousMonthSpend": 4510.22,
  "forecastedSpend": 5032.10,
  "budgetUsagePercent": 80.39
}
```

---

## Dashboard Alerts

### Endpoint

```http
GET /api/v1/dashboard/alerts
```

### Response

```json
[
  {
    "id": "uuid",
    "severity": "HIGH",
    "title": "Budget Exceeded",
    "description": "Monthly budget exceeded by 10%"
  }
]
```

---

# Cost Analysis Endpoints

## Daily Cost Trends

### Endpoint

```http
GET /api/v1/costs/daily
```

### Query Parameters

```text
startDate=2025-01-01
endDate=2025-01-31
```

### Response

```json
[
  {
    "date": "2025-01-01",
    "amount": 125.40
  }
]
```

---

## Monthly Trends

### Endpoint

```http
GET /api/v1/costs/monthly
```

### Response

```json
[
  {
    "month": "2025-01",
    "amount": 4210.55
  }
]
```

---

## Service Breakdown

### Endpoint

```http
GET /api/v1/costs/services
```

### Response

```json
[
  {
    "service": "Amazon EC2",
    "amount": 2100.22,
    "percentage": 43.5
  },
  {
    "service": "Amazon RDS",
    "amount": 950.10,
    "percentage": 19.7
  }
]
```

---

## Top Cost Drivers

### Endpoint

```http
GET /api/v1/costs/top-drivers
```

### Response

```json
[
  {
    "service": "Amazon EC2",
    "amount": 2100.22
  }
]
```

---

# Budget Endpoints

## Create Budget

### Endpoint

```http
POST /api/v1/budgets
```

### Request Body

```json
{
  "name": "Monthly Cloud Budget",
  "amount": 6000,
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

### Response

```json
{
  "success": true,
  "budgetId": "uuid"
}
```

---

## Get Budgets

### Endpoint

```http
GET /api/v1/budgets
```

### Response

```json
[
  {
    "id": "uuid",
    "name": "Monthly Cloud Budget",
    "amount": 6000
  }
]
```

---

## Budget Status

### Endpoint

```http
GET /api/v1/budgets/status
```

### Response

```json
{
  "budget": 6000,
  "currentSpend": 4823.55,
  "usagePercent": 80.39,
  "status": "WARNING"
}
```

---

## Update Budget

### Endpoint

```http
PUT /api/v1/budgets/:id
```

### Request Body

```json
{
  "amount": 7000
}
```

### Response

```json
{
  "success": true
}
```

---

## Delete Budget

### Endpoint

```http
DELETE /api/v1/budgets/:id
```

### Response

```json
{
  "success": true
}
```

---

# Forecast Endpoints

## Generate Forecast

### Endpoint

```http
GET /api/v1/forecast
```

### Response

```json
{
  "method": "moving_average",
  "projectedSpend": 5032.10,
  "forecastMonth": "2025-01"
}
```

---

## Forecast History

### Endpoint

```http
GET /api/v1/forecast/history
```

### Response

```json
[
  {
    "month": "2025-01",
    "projectedSpend": 5032.10
  }
]
```

---

# Alert Endpoints

## Get Alerts

### Endpoint

```http
GET /api/v1/alerts
```

### Response

```json
[
  {
    "id": "uuid",
    "type": "SPEND_SPIKE",
    "severity": "HIGH",
    "title": "Unexpected EC2 Increase",
    "description": "Daily spend increased by 175%"
  }
]
```

---

## Alert Summary

### Endpoint

```http
GET /api/v1/alerts/summary
```

### Response

```json
{
  "totalAlerts": 6,
  "highSeverity": 2,
  "mediumSeverity": 3,
  "lowSeverity": 1
}
```

---

# Reporting Endpoints

## Generate Executive Report

### Endpoint

```http
POST /api/v1/reports/generate
```

### Response

```json
{
  "reportId": "uuid",
  "generated": true
}
```

---

## Get Reports

### Endpoint

```http
GET /api/v1/reports
```

### Response

```json
[
  {
    "id": "uuid",
    "month": "2025-01",
    "title": "January Cost Summary"
  }
]
```

---

## Get Single Report

### Endpoint

```http
GET /api/v1/reports/:id
```

### Response

```json
{
  "title": "January Cost Summary",
  "summary": "Cloud spending increased by 7%.",
  "highlights": [
    "EC2 remained largest cost driver"
  ],
  "recommendations": [
    "Investigate idle EC2 instances"
  ]
}
```

---

# Health Endpoint

## Health Check

### Endpoint

```http
GET /api/v1/health
```

### Response

```json
{
  "status": "healthy",
  "service": "cloudsight-api",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

# Standard Error Response

All endpoints return:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

---

# Validation Rules

## Registration

```text
Name:
2-120 chars

Email:
Valid email

Password:
Minimum 8 chars
At least:
1 uppercase
1 lowercase
1 number
1 special character
```

---

## Budget Validation

```text
Amount > 0

Start date required

End date required

End date > Start date
```

---

## Cost Query Validation

```text
Start date required

End date required

Range <= 365 days
```

---

# Route Inventory

```text
AUTH
POST   /auth/register
POST   /auth/login

DASHBOARD
GET    /dashboard/summary
GET    /dashboard/alerts

COSTS
GET    /costs/daily
GET    /costs/monthly
GET    /costs/services
GET    /costs/top-drivers

BUDGETS
POST   /budgets
GET    /budgets
GET    /budgets/status
PUT    /budgets/:id
DELETE /budgets/:id

FORECAST
GET    /forecast
GET    /forecast/history

ALERTS
GET    /alerts
GET    /alerts/summary

REPORTS
POST   /reports/generate
GET    /reports
GET    /reports/:id

SYSTEM
GET    /health
```

---

# OpenAPI Coverage Goal

Every endpoint should map directly to:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Repository
```

No endpoint should bypass the service layer.

---

# Validation Checklist

* [ ] Every endpoint documented
* [ ] Request schemas defined
* [ ] Response schemas defined
* [ ] Error format standardized
* [ ] Validation rules documented
* [ ] Route inventory complete
* [ ] Document committed to GitHub

---

# Phase 5 Completion Criteria

Phase 5 is complete when:

* API contracts are finalized
* Route inventory is approved
* Validation rules are documented
* Error handling is standardized
* Document is committed to GitHub

Commit:

```bash
git add .
git commit -m "docs: add phase 5 api design"
git push origin main
```
