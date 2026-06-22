# CloudSight Dashboard Data Architecture

Version: 1.0

## Overview

CloudSight follows a Backend-for-Frontend (BFF) architecture.

The React frontend never communicates directly with AWS Cost Explorer,
Budgets, Trusted Advisor, CloudWatch, Bedrock, or other AWS services.

Instead, the frontend consumes business-focused APIs exposed by the
CloudSight backend.

---

## Goals

Reduce frontend complexity.

Reduce API requests.

Reduce AWS costs.

Improve dashboard performance.

Enable independent backend evolution.

---

## Architecture

Frontend

React Dashboard

↓

API Gateway

↓

CloudSight Services

↓

AWS Data Sources

---

## AWS Data Sources

Cost Explorer

AWS Budgets

AWS Organizations

Trusted Advisor

CloudWatch

Bedrock

SNS

---

## Dashboard Endpoint

GET /dashboard

Purpose:

Provide all executive dashboard intelligence in a single request.

Response Shape

{
  "overview": {},
  "summary": {},
  "costDrivers": [],
  "optimization": [],
  "anomalies": []
}

---

## Frontend Consumption

DashboardPage

↓

useDashboard()

↓

ExecutiveOverview

ExecutiveSummary

CostDriversCard

OptimizationCenter

AnomalyCenter

Each component receives only the data slice it requires.

Example:

<ExecutiveOverview
  data={dashboard.overview}
/>

<CostDriversCard
  data={dashboard.costDrivers}
/>

---

## Additional APIs

GET /trends

Used by:

SpendTrendChart

---

GET /services

Used by:

ServiceBreakdownCard

---

GET /forecast

Used by:

ForecastCard

BudgetHealthCard

---

GET /alerts

Used by:

Alert Center

Notifications

Historical Anomalies

---

## Architectural Patterns

Backend Aggregation

Backend for Frontend (BFF)

API Composition

Facade Pattern

---

## Future Expansion

Dashboard Service

Forecast Service

Cost Service

Optimization Service

AI Service

Alert Service

These services may evolve independently while preserving stable frontend APIs.

