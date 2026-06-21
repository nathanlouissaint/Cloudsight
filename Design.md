# CloudSight Design System & Current Build State

Version: 0.1.0
Status: In Active Design & Frontend Development

---

# Project Vision

CloudSight is an enterprise cloud cost intelligence platform.

The goal is to redesign CloudSight from a traditional dashboard into a premium executive SaaS experience comparable to:

* Apple
* Stripe
* Ramp
* Vercel
* Linear
* Datadog
* Notion Calendar
* Arc Browser

This is not a generic admin panel.

The interface should communicate:

* Trust
* Precision
* Intelligence
* Financial Control
* Enterprise Scale

---

# Product Positioning

CloudSight enables organizations to:

* Monitor cloud spend
* Track budgets
* Forecast future costs
* Analyze spend trends
* Detect anomalies
* Generate executive reports
* Identify savings opportunities

Target customers:

* CTOs
* CFOs
* FinOps teams
* Cloud Operations teams
* Enterprise leadership

---

# Current Technology Stack

Frontend:

```txt
React
TypeScript
Vite
CSS
Framer Motion
Lucide React
Recharts
```

Backend:

```txt
Node.js
Express
Prisma
PostgreSQL
AWS
```

Infrastructure:

```txt
Terraform
Docker
Docker Compose
```

---

# Current Repository Structure

```txt
cloudsight
├── client
├── server
├── infrastructure
├── docs
└── CURRENT_STATE_DESIGN.md
```

Frontend structure:

```txt
client/src
├── App.tsx
├── main.tsx
├── index.css
│
├── components
│   ├── layout
│   │   └── DashboardLayout.tsx
│   │
│   ├── navigation
│   │   └── TopNavigation.tsx
│   │
│   ├── dashboard
│   │   ├── ExecutiveHero.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── AnalyticsRow.tsx
│   │   ├── BudgetHealthCard.tsx
│   │   ├── ForecastCard.tsx
│   │   ├── ServiceBreakdownCard.tsx
│   │   ├── AIInsightsPanel.tsx
│   │   └── AnomalyCenter.tsx
│   │
│   ├── charts
│   │   └── SpendTrendChart.tsx
│   │
│   └── ui
│
├── pages
│   └── DashboardPage.tsx
│
├── services
│   └── api.ts
│
├── hooks
├── data
└── types
```

---

# Current Page Architecture

Current page composition:

```tsx
<DashboardLayout>
  <TopNavigation />

  <ExecutiveHero />

  <SummaryCards />

  <AnalyticsRow />
</DashboardLayout>
```

Future page composition:

```tsx
<DashboardLayout>
  <TopNavigation />

  <ExecutiveHero />

  <SummaryCards />

  <AnalyticsRow />

  <ServiceBreakdownCard />

  <ForecastCard />

  <AIInsightsPanel />

  <AnomalyCenter />
</DashboardLayout>
```

---

# Current Design Language

## Backgrounds

```css
#020617
#0F172A
#111827
```

Main layout uses:

```css
radial-gradient()
linear-gradient()
```

for subtle depth.

---

## Card System

Cards use:

```css
rgba(255,255,255,0.04)
rgba(255,255,255,0.06)
```

with:

```css
backdrop-filter: blur(24px);
border: 1px solid rgba(255,255,255,0.08);
```

Goal:

```txt
Glass
Premium
Minimal
Executive
```

---

## Typography

Font stack:

```css
Inter
```

Fallback:

```css
system-ui
-apple-system
```

Typography hierarchy:

Hero Headline:

```css
56px - 84px
font-weight: 700
letter-spacing: -0.06em
```

Card Values:

```css
42px - 52px
font-weight: 700
```

Section Titles:

```css
20px - 24px
font-weight: 600
```

Body:

```css
14px - 18px
```

---

# Color Tokens

## Text

```css
--text-primary: #FFFFFF;
--text-secondary: #CBD5E1;
--text-muted: #94A3B8;
```

## Accent

```css
--accent: #3B82F6;
--accent-light: #60A5FA;
--accent-cyan: #38BDF8;
```

## Status

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

Desktop:

```txt
------------------------------------------------
Navigation
------------------------------------------------

Hero

------------------------------------------------
Current Spend
Forecast
Budget Usage
Savings Opportunity
------------------------------------------------

------------------------------------------------
Spend Trend                  Budget Health
------------------------------------------------

------------------------------------------------
Service Breakdown            Forecast
------------------------------------------------

------------------------------------------------
AI Insights                  Anomalies
------------------------------------------------
```

Grid:

```txt
12-column
```

---

# Current Components

## DashboardLayout

Purpose:

Application shell.

Responsibilities:

* Background
* Max width container
* Responsive spacing

Classes:

```txt
dashboard-layout
dashboard-background
dashboard-container
```

---

## TopNavigation

Purpose:

Executive navigation bar.

Contains:

```txt
CloudSight Logo

Dashboard
Costs
Forecasting
Alerts
Reports

Search
Notifications
Environment Switcher
```

Current style:

```txt
Glassmorphism
Sticky
Blurred
Rounded
```

Inspired by:

```txt
Linear
Vercel
Stripe
```

---

## ExecutiveHero

Purpose:

Communicate value instantly.

Current messaging:

```txt
Financial visibility for
enterprise cloud infrastructure.
```

Contains:

```txt
Healthy Budget
```

status indicator.

Inspired by:

```txt
Apple
Stripe
```

---

## SummaryCards

Purpose:

Executive KPI overview.

Current cards:

### Current Spend

```txt
$3,068
+8.3%
```

### Forecast

```txt
$4,383
+12.7%
```

### Budget Usage

```txt
61.37%
+3.6%
```

### Savings Opportunity

```txt
$1,240
+12.5%
```

Current issue:

Cards are stacking vertically instead of displaying in a 4-column grid.

Investigate:

```css
.summary-grid
```

and responsive overrides.

Expected:

```css
grid-template-columns:
repeat(4, minmax(0,1fr));
```

---

# Analytics Row

Status:

Planned / In Progress

Layout:

```txt
------------------------------------------------
Spend Trend                  Budget Health
------------------------------------------------
```

---

## SpendTrendChart

Technology:

```txt
Recharts
AreaChart
```

Requirements:

```txt
Soft glow
Gradient fill
Muted axes
Interactive tooltip
Smooth animation
```

Inspired by:

```txt
Stripe Analytics
Datadog
```

---

## BudgetHealthCard

Purpose:

Visual budget status.

Displays:

```txt
61.37%
Healthy

Budget
Spent
Remaining
```

Uses:

```css
conic-gradient()
```

for radial progress.

---

# Planned Components

## ServiceBreakdownCard

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

Horizontal bars.

Inspired by:

```txt
Datadog
AWS Cost Explorer
```

---

## ForecastCard

Displays:

```txt
Projected Spend
Variance
Days Remaining
Confidence
```

Includes:

```txt
On Track
```

status.

---

## AIInsightsPanel

Displays:

```txt
Executive Insight

AWS spend remains within budget.

EKS costs increased 14.2%.

Potential monthly savings:
$1,240
```

Future source:

```txt
Amazon Bedrock
LLM generated insights
```

---

## AnomalyCenter

Displays:

```txt
Recent Anomalies

EKS +18.4%
Lambda +42%
RDS +12.1%
```

Severity levels:

```txt
Healthy
Warning
Critical
```

---

# Motion System

Using:

```txt
Framer Motion
```

Effects:

```txt
Fade In
Slide Up
Hover Lift
Page Transitions
```

Card hover:

```css
transform: translateY(-4px);
```

---

# Design Rules

Always:

* Use generous spacing
* Use subtle shadows
* Use soft borders
* Keep information dense but readable
* Prefer quality over quantity
* Design for executives first

Never:

* Use Bootstrap styling
* Use generic dashboard templates
* Use bright neon colors
* Use heavy gradients
* Overcrowd cards

---

# Current Known Issue

Observed in browser:

```txt
Summary cards render vertically
instead of horizontally.
```

Potential causes:

```txt
summary-grid styles not loaded
responsive override active
Safari width triggering breakpoint
CSS ordering issue
```

Must be resolved before proceeding.

---

# Build Commands

Frontend:

```bash
cd client
npm run dev
```

Install packages:

```bash
npm install framer-motion
npm install lucide-react
npm install recharts
```

---

# Immediate Next Milestone

1. Fix KPI card layout.
2. Build AnalyticsRow.
3. Build SpendTrendChart.
4. Build BudgetHealthCard.
5. Connect AnalyticsRow to DashboardPage.
6. Build ServiceBreakdownCard.
7. Build ForecastCard.
8. Build AIInsightsPanel.
9. Build AnomalyCenter.
10. Connect real API data.
