import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAuditHistory,
} from "../services/audit.api";

export const auditQueryKeys = {
  all: ["auth", "audit"] as const,
};

export function useAuditHistory() {
  return useQuery({
    queryKey: auditQueryKeys.all,
    queryFn: getAuditHistory,
  });
}