# CloudSight Phase 2 — UX Design

## Overview

This document defines the complete user experience for CloudSight before frontend development begins.

The purpose of this phase is to remove UI ambiguity, establish navigation patterns, define user journeys, and finalize dashboard layouts before React implementation.

---

# Objective

Design the complete user experience for CloudSight.

Users should be able to:

* Register
* Login
* View cloud spending
* Analyze trends
* Monitor budgets
* View forecasts
* Review anomalies
* Generate executive reports

This phase establishes:

* User flows
* Navigation structure
* Information architecture
* Page layouts
* Dashboard wireframes

No frontend code should be written until this phase is complete.

---

# Architecture Decisions

CloudSight follows a simple authenticated dashboard model.

```text
Public Area

Login
Register

↓

Authenticated Area

Dashboard
Cost Analysis
Budgets
Forecasting
Reports
Settings
```

Design Principles:

* Minimal navigation
* Simple user journeys
* Fast access to key metrics
* Executive-friendly visualizations
* Portfolio-quality presentation
* Mobile responsiveness
* No role-based complexity

---

# Navigation Structure

## Public Routes

```text
/
├── Login
└── Register
```

## Protected Routes

```text
/app
├── Dashboard
├── Cost Analysis
├── Budgets
├── Forecasting
├── Reports
└── Settings
```

---

# Sidebar Navigation

```text
CloudSight

Dashboard
Cost Analysis
Budgets
Forecasting
Reports
Settings

Logout
```

---

# Top Navigation

```text
CloudSight Logo

Search (Future)

User Profile
Settings
Logout
```

---

# User Flows

## Registration Flow

### Goal

Allow users to create an account.

### Flow

```text
Register Page
    ↓
Enter Name
Enter Email
Enter Password
    ↓
Submit
    ↓
Account Created
    ↓
Redirect To Login
    ↓
Login
    ↓
Dashboard
```

### Success Criteria

* Account created successfully
* Password securely stored
* User redirected to login

---

# Login Flow

### Goal

Authenticate users using JWT.

### Flow

```text
Login Page
    ↓
Enter Email
Enter Password
    ↓
Submit
    ↓
JWT Generated
    ↓
Dashboard
```

### Success Criteria

* Valid credentials accepted
* JWT stored securely
* Protected routes accessible

---

# Dashboard Flow

### Goal

Provide immediate cost visibility.

### Flow

```text
Login
    ↓
Dashboard
    ↓
View Key Metrics
    ↓
View Trends
    ↓
View Alerts
```

### Success Criteria

* Metrics visible immediately
* Trends render successfully
* Alerts clearly displayed

---

# Budget Creation Flow

### Goal

Allow budget monitoring.

### Flow

```text
Dashboard
    ↓
Budgets
    ↓
Create Budget
    ↓
Enter Amount
    ↓
Save
    ↓
Budget Status Updated
```

### Success Criteria

* Budget saved
* Usage calculated
* Status displayed

---

# Forecast Flow

### Goal

Allow users to understand projected spend.

### Flow

```text
Forecasting
    ↓
View Forecast
    ↓
Review Projection
    ↓
Compare Against Budget
```

### Success Criteria

* Forecast generated
* Projection visible
* Budget comparison available

---

# Reporting Flow

### Goal

Generate executive summaries.

### Flow

```text
Reports
    ↓
Generate Report
    ↓
View Report
    ↓
Export (Future)
```

### Success Criteria

* Report generated
* Summary readable
* Forecast included

---

# Information Architecture

## Dashboard

Purpose:

Provide executive-level visibility.

Contents:

* Current Month Spend
* Previous Month Spend
* Forecasted Spend
* Budget Usage
* Spend Trend Chart
* Service Breakdown
* Alerts
* Optimization Suggestions

---

## Cost Analysis

Purpose:

Detailed spending analysis.

Contents:

* Daily Trends
* Monthly Trends
* Service Breakdown
* Top Cost Drivers
* Date Range Filter

---

## Budgets

Purpose:

Budget management.

Contents:

* Current Budget
* Budget Usage
* Budget Status
* Create Budget Form

---

## Forecasting

Purpose:

Future cost prediction.

Contents:

* Moving Average Forecast
* End-of-Month Projection
* Forecast Charts
* Forecast Explanation

---

## Reports

Purpose:

Executive reporting.

Contents:

* Monthly Summary
* Cost Highlights
* Forecast Summary
* Optimization Suggestions

---

## Settings

Purpose:

User management.

Contents:

* Profile Information
* Change Password
* Theme Preferences

---

# Dashboard Wireframe

```text
--------------------------------------------------
CloudSight
--------------------------------------------------

[ Current Spend ]
[ Previous Spend ]
[ Forecast Spend ]
[ Budget Usage ]

--------------------------------------------------

Spend Trend Chart

--------------------------------------------------

Service Breakdown Chart

--------------------------------------------------

Recent Alerts

--------------------------------------------------

Optimization Suggestions

--------------------------------------------------
```

---

# Cost Analysis Wireframe

```text
--------------------------------------------------

Date Range Filter

--------------------------------------------------

Daily Spend Trend

--------------------------------------------------

Monthly Spend Trend

--------------------------------------------------

Service Breakdown

--------------------------------------------------

Top Cost Drivers

--------------------------------------------------
```

---

# Budgets Wireframe

```text
--------------------------------------------------

Budget Summary

--------------------------------------------------

Budget Usage Gauge

--------------------------------------------------

Budget Status

Healthy
Warning
Exceeded

--------------------------------------------------

Create / Edit Budget

--------------------------------------------------
```

---

# Forecasting Wireframe

```text
--------------------------------------------------

Forecast Summary

--------------------------------------------------

Moving Average Forecast

--------------------------------------------------

End-of-Month Projection

--------------------------------------------------

Forecast Explanation

--------------------------------------------------
```

---

# Reports Wireframe

```text
--------------------------------------------------

Generate Report

--------------------------------------------------

Monthly Summary

--------------------------------------------------

Cost Highlights

--------------------------------------------------

Forecast Summary

--------------------------------------------------

Optimization Suggestions

--------------------------------------------------
```

---

# Settings Wireframe

```text
--------------------------------------------------

Profile Information

--------------------------------------------------

Change Password

--------------------------------------------------

Theme Toggle

--------------------------------------------------
```

---

# Dashboard Component Inventory

## KPI Cards

* Current Spend
* Previous Spend
* Forecast Spend
* Budget Usage

---

## Charts

### Recharts Components

* Line Chart
* Area Chart
* Bar Chart
* Pie Chart

---

## Tables

### Alerts Table

Columns:

* Date
* Service
* Severity
* Description

---

### Cost Drivers Table

Columns:

* Service
* Monthly Spend
* Percentage

---

# Mobile Experience

Requirements:

* Responsive layouts
* Collapsible sidebar
* Scrollable charts
* Mobile-friendly tables

Target Breakpoints:

```text
Mobile
<768px

Tablet
768px - 1024px

Desktop
>1024px
```

---

# UX Validation Checklist

Before moving to Phase 3:

* [ ] All pages defined
* [ ] Navigation finalized
* [ ] User journeys documented
* [ ] Dashboard wireframes complete
* [ ] Component inventory complete
* [ ] Mobile considerations documented
* [ ] No unresolved UX decisions

---

# Risks

## Scope Creep

Adding pages beyond MVP.

Mitigation:

Maintain current page structure.

---

## Dashboard Overload

Adding too many charts.

Mitigation:

Limit dashboard to highest-value metrics.

---

## Complex Navigation

Too many nested routes.

Mitigation:

Single-level sidebar navigation.

---

# Future Enhancements

* Dark Mode
* Saved Filters
* Dashboard Customization
* CSV Upload Workflow
* Multi-Account Views
* PDF Export
* Scheduled Reports
* Email Notifications
* AI Executive Summaries

---

# Phase 2 Completion Criteria

Phase 2 is complete when:

* UX document exists
* Navigation is finalized
* User flows are approved
* Wireframes are documented
* Dashboard layout is finalized
* Document is committed to GitHub

Commit:

```bash
git add .
git commit -m "docs: add phase 2 ux design"
git push origin main
```
