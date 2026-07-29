import { apiRequest } from "../../lib/apiClient";

import type {
  LogoutAllSessionsResponse,
  Session,
} from "../types/session";

export function getSessions(): Promise<
  Session[]
> {
  return apiRequest<Session[]>(
    "/auth/sessions"
  );
}

export function deleteSession(
  sessionId: string
): Promise<void> {
  return apiRequest<void>(
    `/auth/sessions/${encodeURIComponent(
      sessionId
    )}`,
    {
      method: "DELETE",
    }
  );
}

export function logoutAllSessions(): Promise<
  LogoutAllSessionsResponse
> {
  return apiRequest<LogoutAllSessionsResponse>(
    "/auth/logout-all",
    {
      method: "POST",
    }
  );
}
