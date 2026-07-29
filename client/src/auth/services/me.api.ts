import { apiRequest } from "../../lib/apiClient";

import type { AuthUser } from "../types";

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}
