import {
  ApiError,
  apiRequest,
  apiRequestWithoutRefresh,
} from "../../lib/apiClient";
import {
  clearCsrfToken,
  ensureCsrfToken,
} from "./csrf.api";
import {
  beginSessionRevocation,
  endSessionRevocation,
} from "./refresh.api";

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
  return protectedMutation<void>(
    `/auth/sessions/${encodeURIComponent(
      sessionId
    )}`,
    {
      method: "DELETE",
    }
  );
}

export async function logoutAllSessions(): Promise<
  LogoutAllSessionsResponse
> {
  await beginSessionRevocation();

  try {
    return await protectedMutation<LogoutAllSessionsResponse>(
      "/auth/logout-all",
      {
        method: "POST",
      }
    );
  } finally {
    endSessionRevocation();
  }
}

async function protectedMutation<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const csrfToken = await ensureCsrfToken();

  try {
    return await apiRequestWithoutRefresh<T>(path, {
      ...options,
      headers: {
        ...options.headers,
        "X-CSRF-Token": csrfToken,
      },
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 403
    ) {
      clearCsrfToken();
    }

    throw error;
  }
}
