# CloudSight

<p align="center">
  <img src="docs/screenshots/logo.png" width="140" alt="CloudSight Logo">
</p>

<h1 align="center">CloudSight</h1>

<h3 align="center">
Enterprise Cloud Cost Intelligence Platform
</h3>

<p align="center">
CloudSight is a production-focused full-stack cloud cost intelligence platform that helps engineering teams monitor, forecast, analyze, and optimize cloud spending through modern analytics, forecasting, and operational insights.
</p>

<p align="center">
Built with React • TypeScript • Express • PostgreSQL • Prisma • Docker • AWS
</p>

---

# Overview

CloudSight is an enterprise-inspired FinOps platform designed to demonstrate modern software engineering and cloud engineering practices.

The project models how organizations collect cloud billing data, aggregate analytics, generate forecasts, detect anomalies, and provide executive reporting through a scalable service-oriented architecture.

Rather than being a simple dashboard project, CloudSight emphasizes:

* Clean Architecture
* Repository Pattern
* Service-Oriented Backend
* Contract-Driven APIs
* Backend-Owned Business Logic
* Shared UI System
* Production Deployment
* Docker
* Infrastructure as Code
* AWS Integration

The long-term goal is to evolve CloudSight into a production-grade cloud application showcasing full-stack engineering, cloud architecture, DevOps, and infrastructure automation.

---

# Features

## Executive Dashboard

* Executive KPIs
* Monthly Spend Overview
* Budget Health
* Cloud Service Breakdown
* Account Distribution
* Optimization Center
* Spend Trend Visualization
* Executive Intelligence
* AI Recommendation Panels

---

## Cost Analytics

* Historical Spend Analytics
* Service-Level Analytics
* Multi-Account Analytics
* Trend Analysis
* Cost Breakdown
* Budget Monitoring

---

## Forecasting

Production forecasting engine including:

* Forecast Projection
* Historical Trend Analysis
* Forecast Confidence
* Budget Risk
* Growth Drivers
* Forecast Insights
* Executive Explanation Engine
* Service Forecasting
* Account Forecasting
* Run Rate Analytics

---

## Enterprise Alerts

Backend-owned alert intelligence including:

* Cost Spike Detection
* Forecast Risk Detection
* Budget Breach Detection
* Alert Summary Engine
* Alert Metrics Engine
* Alert Timeline
* Recommendation Engine
* Alert History

---

## Executive Reporting

* Executive Reports
* Budget Reports
* Forecast Reports
* Cost Summaries
* Financial Intelligence

---

# Architecture

## Frontend Architecture

```text
React

↓

React Router

↓

React Query

↓

Feature Hooks

↓

Presentation Components

↓

Shared UI Components
```

---

## Backend Architecture

```text
REST API

↓

Controllers

↓

Domain Services

↓

Repositories

↓

Prisma ORM

↓

PostgreSQL
```

---

## Forecast Engine

```text
Historical Trends

↓

Trend Engine

↓

Projection Engine

↓

Confidence Engine

↓

Growth Driver Engine

↓

Insight Engine

↓

Forecast API
```

---

## Alert Engine

```text
Detection Services

↓

Alert Summary

↓

Alert Metrics

↓

Alert History

↓

Alert Service

↓

REST API
```

---

## Cloud Architecture (Roadmap)

```text
AWS Cost Explorer

↓

AWS Budgets

↓

AWS Organizations

↓

Collection Services

↓

Analytics Engine

↓

Forecast Engine

↓

REST API

↓

React Dashboard
```

---

# Technology Stack

## Frontend

* React 19
* TypeScript
* Vite
* React Router
* React Query
* Recharts
* Framer Motion
* CSS

---

## Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* Zod

---

## Cloud

* AWS SDK v3
* Cost Explorer API
* Budgets API
* Organizations API

---

## DevOps

* Docker
* Docker Compose
* GitHub Actions (Planned)
* Terraform (Planned)

---

# Software Engineering Practices

CloudSight is designed around production engineering principles.

Implemented patterns include:

* Repository Pattern
* Service-Oriented Architecture
* Thin Controllers
* Backend-Owned Business Logic
* Contract-Driven APIs
* Runtime Validation with Zod
* Shared Component Library
* React Query Data Layer
* Feature-Based Organization
* Lazy Loading
* Code Splitting
* Bundle Optimization

---

# Project Structure

```text
CloudSight/

├── client/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── server/
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── frontend/
│   ├── requirements/
│   └── screenshots/
│
├── infrastructure/
│   └── terraform/
│
├── docker-compose.yml
│
└── README.md
```

---

# Current Modules

| Module                | Status         |
| --------------------- | -------------- |
| Dashboard             | ✅ Complete     |
| Cost Analytics        | ✅ Complete     |
| Forecast Engine       | ✅ Complete     |
| Alerts                | ✅ MVP Complete |
| Reports               | ✅ Complete     |
| AWS Integration       | 🚧 In Progress |
| Docker                | 🚧 In Progress |
| Terraform             | 📅 Planned     |
| CI/CD                 | 📅 Planned     |
| Production Deployment | 📅 Planned     |

---

# Database

CloudSight currently uses PostgreSQL with Prisma ORM.

Core models include:

* User
* CloudService
* CloudAccount
* CostRecord
* CostSnapshot
* ServiceCostSnapshot
* Budget
* BudgetSnapshot
* Forecast
* Alert
* AlertHistory
* Report

---

# REST API

Current API endpoints include:

```text
GET    /health

POST   /auth/register
POST   /auth/login

GET    /dashboard

GET    /costs
GET    /forecast

GET    /alerts
GET    /alerts/history

GET    /reports

GET    /analytics
GET    /analytics/accounts
GET    /analytics/services

GET    /aws
```

---

# Performance Optimizations

Implemented optimizations include:

* Route Lazy Loading
* React Code Splitting
* Manual Vendor Chunking
* Query Chunk Separation
* Chart Chunk Separation
* Animation Chunk Separation
* Bundle Analysis
* Shared UI Components

---

# Docker

CloudSight is fully containerized for local development.

Services include:

* React Client
* Express API
* PostgreSQL

Start the project with:

```bash
docker compose up --build
```

---

# Local Development

## Clone Repository

```bash
git clone git@github.com:nathanlouissaint/Cloudsight.git

cd Cloudsight
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create the required environment files.

```text
server/.env
```

Configure:

* DATABASE_URL
* JWT_SECRET
* AWS_PROVIDER

---

## Start Development

Using Docker

```bash
docker compose up --build
```

Or manually

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

---

# Screenshots

Coming Soon

* Executive Dashboard
* Cost Analytics
* Forecasting
* Enterprise Alerts
* Reports
* Docker Deployment
* AWS Architecture

---

# Infrastructure Roadmap

CloudSight is evolving into a production-ready cloud application.

Planned infrastructure includes:

* Docker Production Images
* Nginx Reverse Proxy
* GitHub Actions
* Terraform
* AWS EC2
* Amazon RDS PostgreSQL
* IAM
* VPC
* Security Groups
* CloudWatch
* Cost Explorer Integration
* AWS Budgets
* Organizations API

---

# Development Roadmap

## Phase 10

Production Readiness

* Repository Cleanup
* Professional Documentation
* Demo Mode
* Root Development Scripts
* Docker Improvements

---

## Phase 11

Cloud Infrastructure

* Terraform
* CI/CD
* Production Docker
* AWS Deployment
* Monitoring

---

## Phase 12

Enterprise Cloud Platform

* Live AWS Cost Data
* CloudWatch Integration
* Scheduled Collection Jobs
* Production Monitoring
* Public Demo Environment

---

# Why CloudSight?

CloudSight was built to demonstrate practical software engineering beyond CRUD applications.

The project focuses on:

* Enterprise backend architecture
* Cloud-native application design
* Modern React architecture
* Scalable service layers
* Production deployment practices
* Cloud engineering workflows
* Infrastructure automation

It represents the progression from application development to production cloud engineering.

---

# Future Enhancements

* Live AWS Cost Explorer integration
* CloudWatch monitoring
* GitHub Actions deployment pipeline
* Terraform infrastructure provisioning
* Production demo environment
* Authentication improvements
* Executive PDF reporting
* Multi-cloud provider support
* Kubernetes deployment

---

# License

MIT License

---

<p align="center">
Built by <strong>Nathan Louissaint</strong>

Production-focused Full-Stack & Cloud Engineering Portfolio Project

</p>
