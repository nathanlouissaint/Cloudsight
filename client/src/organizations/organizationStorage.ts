const ORGANIZATION_ID_KEY =
  "cloudsight.organizationId";

export function getStoredOrganizationId():
  | string
  | null {
  return localStorage.getItem(
    ORGANIZATION_ID_KEY,
  );
}

export function setStoredOrganizationId(
  organizationId: string,
): void {
  localStorage.setItem(
    ORGANIZATION_ID_KEY,
    organizationId,
  );
}

export function clearStoredOrganizationId():
  void {
  localStorage.removeItem(
    ORGANIZATION_ID_KEY,
  );
}
