# CloudSight

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?logo=terraform)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?logo=amazonaws)
![License](https://img.shields.io/badge/License-MIT-green)

**A cloud-native FinOps platform for monitoring, forecasting, and optimizing cloud infrastructure costs.**

Designed to demonstrate modern full-stack engineering, cloud architecture, Infrastructure as Code, CI/CD, and production deployment practices using AWS.

</div>

---

# Executive Summary

CloudSight is a production-oriented cloud cost intelligence platform built to simulate the type of engineering challenges encountered when designing and operating modern SaaS applications in AWS.

The project extends beyond a traditional CRUD application by combining full-stack software engineering with cloud infrastructure, deployment automation, operational tooling, and infrastructure provisioning.

Rather than focusing exclusively on application development, CloudSight demonstrates the complete software delivery lifecycle:

- Designing scalable frontend and backend services
- Managing relational data with PostgreSQL and Prisma
- Containerizing applications with Docker
- Provisioning AWS infrastructure using Terraform
- Automating deployments through GitHub Actions
- Managing secrets with AWS Systems Manager Parameter Store
- Deploying immutable application artifacts
- Bootstrapping production EC2 instances automatically
- Building repeatable deployment pipelines

The objective of this repository is to showcase engineering practices used to build, deploy, and operate production software—not simply develop an application.

---

# Table of Contents

- Overview
- Problem Statement
- Solution
- Key Features
- Technology Stack
- Architecture
- Repository Structure
- Local Development
- Infrastructure
- CI/CD Pipeline
- Production Deployment
- Security
- Documentation
- Roadmap
- Lessons Learned
- License

---

# Overview

CloudSight provides executive-level visibility into cloud spending through a modern web application backed by a production-ready engineering platform.

The application aggregates cloud cost information, visualizes spending trends, forecasts future costs, tracks budgets, and surfaces optimization opportunities through an interactive dashboard.

Beyond the application itself, the repository demonstrates how cloud-native software can be designed, provisioned, tested, deployed, and maintained using modern engineering practices.

Core capabilities include:

- Executive dashboard
- Cloud spend analytics
- Budget monitoring
- Cost forecasting
- Alert generation
- Infrastructure provisioning
- Immutable deployments
- Automated CI/CD
- Docker-based development
- Production-ready architecture

---

# Problem Statement

Organizations often rely on multiple AWS services and billing tools to understand infrastructure costs.

While AWS provides detailed billing information, translating that data into actionable business insights requires additional tooling.

Engineering teams frequently need answers to questions such as:

- Which services contribute most to monthly spending?
- Are we likely to exceed our budget?
- What is driving cost increases?
- How has spending changed over time?
- Which resources should be optimized first?

CloudSight centralizes these insights into a single application while demonstrating how a production SaaS platform can be engineered from the infrastructure layer through the user interface.

---

# Solution

CloudSight combines several engineering disciplines into a unified project.

## Full-Stack Development

- React 19
- TypeScript
- Express
- REST APIs
- PostgreSQL
- Prisma ORM
- TanStack Query

## Cloud Engineering

- AWS EC2
- Application Load Balancer
- Auto Scaling
- IAM
- VPC
- Systems Manager Parameter Store

## DevOps

- Docker
- Docker Compose
- Nginx
- GitHub Actions
- Immutable deployments
- SHA-256 artifact verification

## Infrastructure as Code

- Terraform
- Modular architecture
- Reusable infrastructure modules
- Environment isolation
- Automated provisioning

---

# Why I Built CloudSight

CloudSight was built to deepen my understanding of production software engineering beyond application development.

Many portfolio projects demonstrate frontend development or backend APIs in isolation. This project was intentionally designed to cover the broader responsibilities involved in delivering and operating software in production.

Throughout the project I focused on understanding how modern engineering teams build, deploy, and maintain cloud-native applications, including infrastructure provisioning, deployment automation, containerization, operational tooling, and secure runtime configuration.

The goal was not simply to build a dashboard—it was to build the engineering platform required to run it.

---

# Key Features

## Executive Dashboard

Provides a consolidated view of cloud spending, budgets, forecasts, and optimization opportunities.

## Historical Analytics

Visualizes spending trends across multiple cloud services over time.

## Forecast Engine

Projects future cloud costs using historical usage patterns.

## Budget Tracking

Monitors monthly budgets and highlights projected overruns before they occur.

## Alerting

Detects cost anomalies, forecast risks, and budget threshold violations.

## Infrastructure Automation

Provision AWS infrastructure using modular Terraform configurations.

## Immutable Deployments

Deploy versioned application artifacts while separating runtime configuration from build artifacts.

## Secure Secret Management

Retrieve production secrets at runtime using AWS Systems Manager Parameter Store.

## CI/CD

Automated verification, builds, testing, image publishing, and deployment through GitHub Actions.

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 19, TypeScript, Vite, TanStack Query, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Infrastructure | AWS EC2, VPC, IAM, ALB, Auto Scaling, SSM |
| DevOps | Docker, Docker Compose, Nginx |
| IaC | Terraform |
| CI/CD | GitHub Actions |
| Version Control | Git |
| Package Manager | npm |

---

> **Next:** System Architecture, repository walkthrough, request lifecycle, deployment architecture, Terraform infrastructure, CI/CD pipeline, and detailed engineering documentation.