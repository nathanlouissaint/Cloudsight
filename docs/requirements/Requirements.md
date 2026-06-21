# CloudSight Product Requirements Document

## Product Name

CloudSight

## Product Summary

CloudSight is a cloud cost visibility dashboard that helps users understand cloud spending, identify trends, forecast future costs, monitor budgets, detect anomalies, and generate executive summaries.

The portfolio version uses mock AWS billing data, generated cost data, and future CSV uploads instead of live AWS credentials.

## Purpose

CloudSight is built to demonstrate:

* Cloud architecture knowledge
* AWS cost management concepts
* Full-stack development skills
* DevOps fundamentals
* Infrastructure as Code awareness
* Technical documentation ability
* Interview-ready system design thinking

This is not a commercial SaaS product. The goal is a polished, working portfolio application.

## Target Users

### Cloud Engineer

Wants to understand cost trends, validate service-level spending, and explain cost changes.

### FinOps Analyst

Wants budget visibility, anomaly detection, monthly summaries, and cost drivers.

### Engineering Manager

Wants simplified views of current spend, forecasted spend, and budget risk.

### Executive Stakeholder

Wants non-technical monthly summaries, highlights, forecast summaries, and optimization suggestions.

## MVP Features

### Authentication

Users can register, log in, and access protected dashboard routes using JWT authentication.

### Dashboard Summary

Users can view:

* Current month spend
* Previous month spend
* Forecasted month-end spend
* Budget usage percentage

### Cost Analysis

Users can view:

* Daily spend trends
* Monthly spend trends
* Service-level cost breakdown
* Top cost drivers

### Budget Monitoring

Users can:

* Create a budget
* View budget usage
* See warning states when usage approaches or exceeds limits

### Forecasting

The system calculates:

* Moving average forecast
* End-of-month projected spend

### Anomaly Detection

The system detects:

* Sudden daily spend increases
* Budget breaches

Detection will use simple statistical rules, not machine learning.

### Executive Reporting

The system generates a template-based monthly summary containing:

* Total spend
* Major cost changes
* Forecast summary
* Budget status
* Optimization suggestions

## Data Sources

The MVP uses:

* Mock AWS billing data
* Generated cost records
* Seeded PostgreSQL records

Future versions may support:

* CSV uploads
* AWS Cost Explorer
* AWS Budgets
* AWS Organizations
* AWS Trusted Advisor

## Non-Goals

The MVP will not include:

* Real AWS billing API integration
* Multi-account AWS Organizations support
* Multi-tenant SaaS architecture
* Kubernetes
* Microservices
* Event-driven serverless workflows
* AI-generated reports
* Enterprise-scale access control

## Success Criteria

CloudSight is successful when:

* A user can register and log in
* A user can view realistic cloud cost metrics
* A user can analyze cost trends and service breakdowns
* A user can create and monitor budgets
* A user can see forecasted month-end spend
* A user can view anomaly alerts
* A user can generate a readable executive report
* The project can be explained clearly in interviews
* The repository is clean, documented, and easy to run locally

## Constraints

* No AWS credentials required
* Local development must work through Docker Compose
* PostgreSQL is the system of record
* Code must be written in TypeScript
* Architecture must stay simple and portfolio-focused

## Future Enhancements

* CSV billing upload
* AWS Cost Explorer integration
* AWS Budgets integration
* Terraform deployment
* GitHub Actions CI/CD
* S3 report storage
* SNS-style email notifications
* AI-assisted executive summaries
