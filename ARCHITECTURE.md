## Organization Tenancy Model

CloudSight uses organization-scoped tenancy for business data.

Identity remains user-owned:

`User`

Users gain tenant access through:

`User -> OrganizationMember -> Organization`

Business data is owned by the selected organization, either directly or through a CloudAccount:

`Organization -> Budget`

`Organization -> AlertHistory`

`Organization -> ReportNote`

`Organization -> CloudAccount -> CostSnapshot`

`Organization -> CloudAccount -> ServiceCostSnapshot`

Authenticated tenant requests follow:

`authenticateToken`
`-> requireOrganizationContext`
`-> requireOrganizationPermission(...)`
`-> controller/service/repository`

The organization context is selected using the `X-Organization-Id` request header and is accepted only when the authenticated user has a matching OrganizationMember record.

Authorization uses explicit permissions mapped to organization roles:

- OWNER
- ADMIN
- MEMBER
- VIEWER

Business-data queries must include `organizationId` directly or traverse through an organization-owned CloudAccount. Cross-tenant resource lookups must not resolve resources outside the selected organization.
