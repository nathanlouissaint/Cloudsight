import { apiRequest } from "../../lib/apiClient";

import type {
  AuditEvent,
} from "../types/audit";

export function getAuditHistory(): Promise<
  AuditEvent[]
> {
  return apiRequest<AuditEvent[]>(
    "/auth/audit"
  );
}