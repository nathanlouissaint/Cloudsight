# CloudSight Master Blueprint

## Project Overview

CloudSight is a portfolio-grade cloud cost visibility dashboard designed to demonstrate:

* AWS Architecture Knowledge
* Cloud Engineering Skills
* Full Stack Development
* DevOps Practices
* Infrastructure as Code Concepts
* Technical Documentation

CloudSight helps users:

* Understand cloud spending
* Analyze cost trends
* Monitor budgets
* Forecast future spend
* Detect anomalies
* Generate executive reports

---

# Project Status Dashboard

| Phase    | Status        | Deliverable                |
| -------- | ------------- | -------------------------- |
| Phase 1  | ✅ Complete    | Requirements               |
| Phase 2  | ✅ Complete    | UX Design                  |
| Phase 3  | ✅ Complete    | Architecture Design        |
| Phase 4  | ✅ Complete    | Database Design            |
| Phase 5  | ✅ Complete    | API Design                 |
| Phase 6  | ✅ Complete    | Repository Design          |
| Phase 7  | ⬜ Not Started | Infrastructure             |
| Phase 8  | ⬜ Not Started | Backend Development        |
| Phase 9  | ⬜ Not Started | Frontend Development       |
| Phase 10 | ⬜ Not Started | Testing                    |
| Phase 11 | ⬜ Not Started | Documentation Finalization |

---

# Architecture Vision

## Portfolio MVP

```text
React Dashboard
        ↓
Express API
        ↓
PostgreSQL
```

---

## Future AWS Architecture

```text
React Frontend
      ↓
API Gateway
      ↓
Lambda Services
      ↓
AWS Billing Sources

Cost Explorer
Budgets
Organizations
Trusted Advisor

      ↓

DynamoDB
S3
CloudWatch
SNS
KMS
```

Future AWS architecture is documented but not required for MVP.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Material UI
* Recharts
* React Router

## Backend

* Node.js
* Express
* TypeScript
* JWT
* bcrypt
* Zod

## Database

* PostgreSQL
* Prisma ORM

## Infrastructure

* Docker
* Docker Compose

## IaC

* Terraform

## Testing

* Jest
* Supertest

## Documentation

* Markdown

---

# Functional Scope

## Authentication

### MVP

* Registration
* Login
* JWT Authentication
* Protected Routes

Status:

```text
⬜ Not Started
```

---

## Dashboard

### MVP

* Current Month Spend
* Previous Month Spend
* Forecasted Spend
* Budget Usage

Status:

```text
⬜ Not Started
```

---

## Cost Analysis

### MVP

* Daily Trends
* Monthly Trends
* Service Breakdown
* Top Cost Drivers

Status:

```text
⬜ Not Started
```

---

## Budget Monitoring

### MVP

* Create Budget
* View Budget
* Budget Status
* Budget Warnings

Status:

```text
⬜ Not Started
```

---

## Forecasting

### MVP

* Moving Average Forecast
* End-of-Month Projection

Status:

```text
⬜ Not Started
```

---

## Anomaly Detection

### MVP

* Spend Spike Detection
* Budget Breach Detection

Status:

```text
⬜ Not Started
```

---

## Executive Reporting

### MVP

* Monthly Summary
* Cost Highlights
* Forecast Summary
* Optimization Suggestions

Status:

```text
⬜ Not Started
```

---

# Database Entities

## Planned Tables

```text
users
cloud_services
cost_records
budgets
alerts
forecasts
reports
```

Status:

```text
✅ Designed
⬜ Implemented
```

---

# API Inventory

## Authentication

```text
POST /auth/register
POST /auth/login
```

## Dashboard

```text
GET /dashboard/summary
GET /dashboard/alerts
```

## Costs

```text
GET /costs/daily
GET /costs/monthly
GET /costs/services
GET /costs/top-drivers
```

## Budgets

```text
POST   /budgets
GET    /budgets
GET    /budgets/status
PUT    /budgets/:id
DELETE /budgets/:id
```

## Forecast

```text
GET /forecast
GET /forecast/history
```

## Alerts

```text
GET /alerts
GET /alerts/summary
```

## Reports

```text
POST /reports/generate
GET /reports
GET /reports/:id
```

## Health

```text
GET /health
```

Status:

```text
✅ Designed
⬜ Implemented
```

---

# Build Roadmap

## Phase 7 Infrastructure

### Deliverables

* Docker Compose
* Dockerfiles
* Environment Variables
* Local Development Environment

Files:

```text
docker-compose.yml

client.Dockerfile
server.Dockerfile

.env.example
```

Status:

```text
⬜ Not Started
```

---

## Phase 8 Backend Development

### Backend Foundation

```text
Server Setup
Database Connection
Prisma
Environment Config
```

### Authentication

```text
Register API
Login API
JWT Middleware
```

### Dashboard APIs

```text
Summary Endpoint
Alerts Endpoint
```

### Cost APIs

```text
Daily Trends
Monthly Trends
Service Breakdown
Top Drivers
```

### Budget APIs

```text
CRUD Operations
Budget Status Logic
```

### Forecast APIs

```text
Moving Average Forecast
History Endpoint
```

### Alert APIs

```text
Spend Spike Detection
Budget Breach Detection
```

### Report APIs

```text
Generate Reports
View Reports
```

Status:

```text
⬜ Not Started
```

---

## Phase 9 Frontend Development

### Authentication Pages

```text
Login
Register
```

### Dashboard

```text
Metric Cards
Charts
Alerts
```

### Cost Analysis

```text
Daily Trend
Monthly Trend
Breakdown
```

### Budgets

```text
Budget Management
Status Cards
```

### Forecasting

```text
Forecast Charts
Projection Cards
```

### Reports

```text
Report Viewer
```

### Settings

```text
Profile
Theme
```

Status:

```text
⬜ Not Started
```

---

## Phase 10 Testing

### Backend

```text
Unit Tests
Service Tests
Repository Tests
```

### API

```text
Supertest
Integration Tests
```

### Frontend

```text
Component Tests
Page Tests
```

Status:

```text
⬜ Not Started
```

---

## Phase 11 Documentation

### Required

```text
README
Architecture Guide
API Guide
Database Guide
Setup Guide
Deployment Guide
```

### Portfolio Assets

```text
Architecture Diagrams
Screenshots
Demo Walkthrough
Interview Talking Points
```

Status:

```text
⬜ Not Started
```

---

# Definition of Done

CloudSight is complete when:

## Application

* User can register
* User can login
* Dashboard works
* Cost analysis works
* Budgets work
* Forecasting works
* Alerts work
* Reports work

## Engineering

* Dockerized
* Database seeded
* Tests pass
* No TypeScript errors
* No lint errors

## Documentation

* README complete
* Setup guide complete
* Architecture documented
* API documented

## Portfolio

* Screenshots created
* GitHub repository polished
* Architecture diagrams included
* Project ready for interviews

---

# Progress Tracker

Current Progress:

```text
Phase 1  ✅
Phase 2  ✅
Phase 3  ✅
Phase 4  ✅
Phase 5  ✅
Phase 6  ✅
Phase 7  ⬜
Phase 8  ⬜
Phase 9  ⬜
Phase 10 ⬜
Phase 11 ⬜
```

Overall Completion:

```text
54.5%
(6 of 11 phases complete)
```

---

# Next Action

Proceed to:

```text
Phase 7
Infrastructure
```

First implementation milestone:

```text
Docker Compose
Dockerfiles
Environment Configuration
Local Development Setup
```
