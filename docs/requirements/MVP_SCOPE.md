# CloudSight MVP Scope and Acceptance Criteria

## MVP Scope

### Included

CloudSight MVP includes:

* React TypeScript frontend
* Express TypeScript backend
* PostgreSQL database
* JWT authentication
* Mock AWS billing dataset
* Dashboard summary metrics
* Daily and monthly cost trends
* Service-level cost breakdown
* Budget creation and monitoring
* Moving average forecast
* End-of-month projection
* Basic anomaly detection
* Template-based executive report
* Docker Compose local environment
* Markdown documentation

### Excluded

CloudSight MVP excludes:

* Real AWS account connection
* AWS Cost Explorer API calls
* AWS Budgets API calls
* AWS Organizations integration
* Trusted Advisor integration
* AI-generated reporting
* Kubernetes
* Microservices
* Multi-region deployment
* Multi-tenant SaaS features
* Enterprise RBAC

## Acceptance Criteria

### Authentication

* User can register with name, email, and password.
* User can log in with email and password.
* Backend returns a JWT after successful login.
* Protected API routes reject unauthenticated requests.

### Dashboard

* Dashboard displays current month spend.
* Dashboard displays previous month spend.
* Dashboard displays forecasted spend.
* Dashboard displays budget usage percentage.

### Cost Analysis

* User can view daily cost trends.
* User can view monthly cost trends.
* User can view cost by service.
* User can view top cost drivers.

### Budgets

* User can create a monthly budget.
* User can view current usage against budget.
* Budget status returns healthy, warning, or exceeded.

### Forecasting

* API returns moving average forecast.
* API returns projected end-of-month spend.
* Forecast logic works using mock/generated cost data.

### Anomaly Detection

* API identifies daily spend spikes.
* API identifies budget breaches.
* Anomalies include date, service, severity, and explanation.

### Executive Reporting

* User can generate a monthly executive report.
* Report includes spend summary, budget status, forecast summary, cost drivers, and optimization suggestions.

### Documentation

* README explains project purpose, stack, setup, and architecture.
* Requirements documentation explains product scope.
* Future AWS integrations are documented separately from MVP functionality.

## Validation Checklist

* Requirements are clear.
* MVP scope is limited.
* Non-goals are explicit.
* User stories map to features.
* Acceptance criteria are testable.
* AWS future-state architecture is acknowledged without overbuilding the MVP.

## Risks

* Scope creep into serverless architecture too early.
* Spending too much time on diagrams instead of working code.
* Adding AI before core reporting works.
* Building fake enterprise complexity that weakens the portfolio story.

## Future Enhancements

* CSV billing upload
* Terraform deployment
* GitHub Actions CI/CD
* AWS Cost Explorer integration
* AWS Budgets integration
* Email notification workflow
* AI-assisted executive summaries
