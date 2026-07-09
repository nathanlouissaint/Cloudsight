# CloudSight Design System & Current Build State

Version: 0.2.0
Status: Frontend Dashboard Foundation Complete

---

# Project Vision

CloudSight is an enterprise FinOps and Cloud Cost Intelligence platform designed for modern engineering organizations.

The platform enables executive and operational visibility into cloud spending, forecasting, budgeting, optimization opportunities, and cost anomalies.

CloudSight is being designed to feel closer to:

* Stripe
* Ramp
* Linear
* Vercel
* Datadog
* Arc Browser

than traditional AWS dashboards.

The objective is to create a premium executive SaaS experience that communicates:

* Trust
* Intelligence
* Financial Control
* Enterprise Scale
* Operational Visibility

---

# Target Users

## Executive Stakeholders

* CFO
* CTO
* VP Engineering
* Director of Infrastructure

## Operational Stakeholders

* FinOps Teams
* Cloud Engineers
* DevOps Engineers
* Platform Teams
* Cloud Operations Teams

---

# Product Capabilities

CloudSight enables organizations to:

* Monitor cloud spend
* Analyze spending trends
* Forecast month-end costs
* Track budget health
* Detect anomalies
* Generate executive summaries
* Surface optimization opportunities
* Produce financial reporting

Future capabilities:

* AI-generated recommendations
* Multi-account AWS visibility
* Multi-tenant SaaS architecture
* Slack notifications
* Microsoft Teams notifications
* Automated executive reporting

---

# Technology Stack

## Frontend

```txt
React
TypeScript
Vite
Framer Motion
Lucide React
Recharts
CSS
```

## Backend

```txt
Node.js
Express
Prisma
PostgreSQL
AWS
```

## Infrastructure

```txt
Terraform
Docker
Docker Compose
```

---

# Current Dashboard Architecture

```txt
Dashboard

├── TopNavigation
│
├── ExecutiveHero
│
├── SummaryCards
│
├── AnalyticsRow
│   ├── SpendTrendChart
│   └── BudgetHealthCard
│
├── OperationsRow
│   ├── ServiceBreakdownCard
│   └── ForecastCard
│
└── IntelligenceRow
    ├── AIInsightsPanel
    └── AnomalyCenter
```

---

# Component Status

## TopNavigation

Status: Complete

Features:

* Sticky navigation
* Glassmorphism styling
* Search
* Notifications
* Environment selector
* Executive SaaS styling

Navigation Items:

```txt
Dashboard
Costs
Forecasting
Alerts
Reports
```

---

## ExecutiveHero

Status: Functional

Current Messaging:

```txt
Financial visibility for enterprise cloud infrastructure.
```

Contains:

```txt
Healthy Budget
```

status indicator.

### Planned Refactor

Replace marketing-style hero with executive dashboard overview.

Future content:

```txt
Current Forecast
Budget Status
Forecast Confidence
Executive Summary
```

Goal:

Reduce vertical height by approximately 50%.

---

## SummaryCards

Status: Complete

Displays:

### Current Spend

```txt
$3,068
```

### Forecast

```txt
$4,383
```

### Budget Usage

```txt
61.37%
```

### Savings Opportunity

```txt
$1,240
```

Features:

* 4-column desktop layout
* Responsive grid
* Hover interactions
* Motion animations

Purpose:

Provide immediate executive visibility.

---

# Analytics Layer

## AnalyticsRow

Status: Complete

Layout:

```txt
Spend Trend          Budget Health
```

---

## SpendTrendChart

Status: Complete

Technology:

```txt
Recharts
AreaChart
```

Features:

* Gradient area fill
* Tooltip interactions
* Trend visualization
* Executive analytics styling

Purpose:

Answer:

```txt
How is spend changing over time?
```

---

## BudgetHealthCard

Status: Complete

Displays:

```txt
Budget
Spent
Remaining
Health Status
```

Visualization:

```txt
Radial Progress
```

Purpose:

Answer:

```txt
Are we currently healthy?
```

---

# Operations Layer

## OperationsRow

Status: Complete

Layout:

```txt
Service Breakdown     Forecast Overview
```

---

## ServiceBreakdownCard

Status: Complete

Displays:

```txt
EC2
EKS
RDS
ECS
CloudFront
S3
Lambda
Route53
```

Visualization:

```txt
Horizontal utilization bars
```

Purpose:

Answer:

```txt
Where is cloud spend concentrated?
```

---

## ForecastCard

Status: Complete

Displays:

```txt
Projected Spend
Variance
Days Remaining
Confidence
```

Status:

```txt
On Track
```

Purpose:

Answer:

```txt
Where will spending finish this month?
```

---

# Intelligence Layer

## IntelligenceRow

Status: Complete

Layout:

```txt
AI Insights      Anomaly Center
```

---

## AIInsightsPanel

Status: Complete

Current Capabilities:

```txt
Budget Summary
Cost Growth Insights
Optimization Opportunities
```

Future Source:

```txt
Amazon Bedrock
```

Purpose:

Generate executive-level recommendations.

---

## AnomalyCenter

Status: Complete

Displays:

```txt
Lambda +42%

EKS +18.4%

RDS +12.1%
```

Severity Levels:

```txt
Healthy
Warning
Critical
```

Purpose:

Answer:

```txt
What requires immediate attention?
```

---

# Design System

## Background Colors

```css
#020617
#0F172A
#111827
```

---

## Card System

```css
rgba(255,255,255,0.04)
rgba(255,255,255,0.06)
```

Effects:

```css
backdrop-filter: blur(24px);

border:
1px solid rgba(255,255,255,0.08);
```

Design Intent:

```txt
Premium
Executive
Minimal
Modern
```

---

## Typography

Font:

```css
Inter
```

Fallback:

```css
system-ui
```

Hierarchy:

### Hero

```txt
56px–84px
```

### Metrics

```txt
42px–52px
```

### Section Titles

```txt
20px–24px
```

### Body

```txt
14px–18px
```

---

## Status Colors

Healthy:

```css
#22C55E
```

Warning:

```css
#F59E0B
```

Critical:

```css
#EF4444
```

---

# Dashboard Layout Strategy

Desktop Layout:

```txt
------------------------------------------------
Navigation
------------------------------------------------

Executive Hero

------------------------------------------------
Current Spend
Forecast
Budget Usage
Savings Opportunity
------------------------------------------------

------------------------------------------------
Spend Trend                 Budget Health
------------------------------------------------

------------------------------------------------
Service Breakdown           Forecast
------------------------------------------------

------------------------------------------------
AI Insights                 Anomalies
------------------------------------------------
```

Grid System:

```txt
12 Columns
```

---

# API Integration Plan

Replace all mock data with live API responses.

Planned Endpoints:

```txt
GET /summary

GET /services

GET /trends

GET /forecast

GET /alerts

GET /health
```

---

# Planned Data Layer

Introduce:

```txt
React Query
```

for:

```txt
Caching
Loading States
Error Handling
Polling
Optimistic Updates
```

---

# Remaining Frontend Milestones

## Sprint 4

### Executive Hero Refactor

Replace marketing hero with:

```txt
Executive Overview
Forecast Status
Budget Status
Confidence Score
```

---

### API Service Layer

Build:

```txt
services/api.ts
```

for:

```txt
Summary API
Services API
Forecast API
Trend API
Alerts API
Health API
```

---

### State Management

Implement:

```txt
React Query
```

---

### Loading States

Add:

```txt
Skeleton Loaders
Empty States
Error States
Retry States
```

---

### Real Data Integration

Connect:

```txt
SummaryCards
SpendTrendChart
BudgetHealthCard
ServiceBreakdownCard
ForecastCard
AIInsightsPanel
AnomalyCenter
```

to backend APIs.

---

# Future Pages

## Costs

Detailed cloud spend analysis.

## Forecasting

Forecast engine and predictions.

## Alerts

Anomaly and budget monitoring.

## Reports

Executive reporting and exports.

---

# Future AI Roadmap

Amazon Bedrock Integration:

```txt
Executive Summaries

Optimization Recommendations

Forecast Explanations

Anomaly Explanations

Cost Reduction Suggestions
```

---

# Architecture Alignment

Current dashboard aligns with system architecture:

```txt
Summary
Services
Trends
Forecast
Alerts
Health
```

Future backend architecture:

```txt
AWS Cost Explorer
Lambda
Step Functions
DynamoDB
S3
CloudWatch
SNS
Bedrock
```

---

# Current Assessment

| Category            | Score  |
| ------------------- | ------ |
| Visual Design       | 9/10   |
| Enterprise Feel     | 8.5/10 |
| Information Density | 8/10   |
| Executive Utility   | 7.5/10 |
| FinOps Credibility  | 8/10   |
| SaaS Quality        | 9/10   |

---

# Next Sprint Goal

Transform CloudSight from a design prototype into a production-ready FinOps application by replacing all static dashboard data with live backend services and introducing enterprise-grade state management, loading states, error handling, and AI-powered operational intelligence.
