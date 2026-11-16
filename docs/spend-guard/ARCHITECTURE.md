# Spend Guard Architecture

## Funnel

Landing
→ Signup
→ Authentication
→ Organization provisioning
→ AWS verification
→ Budget configuration
→ Analysis
→ Result

## Tenant Boundary

User
→ OrganizationMember
→ Organization

Organization owns:
- CloudAccount
- Budget
- AlertHistory
- ReportNote

## AWS Boundary

CloudSight workload identity
→ AWS STS
→ AssumeRole
→ customer IAM role
→ temporary credentials
→ Cost Explorer

No customer long-lived AWS credentials should be stored.

## Development Mock Boundary

Development may use:

SPEND_GUARD_MOCK_AWS=true

Production must never accept mocked AWS verification.

## Data Direction

Avoid rebuilding features on legacy global models.

Prefer:

Organization
→ CloudAccount
→ CostSnapshot
→ ServiceCostSnapshot

instead of:

CostRecord
CloudService
BudgetSnapshot
