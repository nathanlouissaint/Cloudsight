import { setAccessToken } from "../utils/tokenStorage";
import {
  clearCsrfToken,
  ensureCsrfToken,
  setCsrfTokenFromResponse,
} from "./csrf.api";

const API_URL =
  import.meta.env?.VITE_API_URL ??
  "http://localhost:5001";

interface RefreshResponse {
  accessToken: string;
  csrfToken: unknown;
  csrfExpiresAt: unknown;
}

let refreshPromise: Promise<string> | null =
  null;
let refreshGeneration = 0;
let sessionRevocationDepth = 0;

export function invalidateRefreshAccess(): void {
  refreshGeneration += 1;
}

/**
 * Block new refreshes and wait for an already-started refresh response before
 * revoking sessions. Browsers may process Set-Cookie even when JavaScript
 * ignores or aborts a response, so revocation must be ordered after it.
 */
export async function beginSessionRevocation(): Promise<void> {
  sessionRevocationDepth += 1;
  const pendingRefresh = refreshPromise;

  if (pendingRefresh) {
    try {
      await pendingRefresh;
    } catch {
      // Revocation must still proceed when refresh failed.
    }
  }

  invalidateRefreshAccess();
}

export function endSessionRevocation(): void {
  sessionRevocationDepth = Math.max(
    0,
    sessionRevocationDepth - 1,
  );
}

function staleRefreshError(): Error {
  return new Error(
    "Refresh result is no longer current.",
  );
}

async function requestAccessToken(): Promise<string> {
  const requestGeneration =
    refreshGeneration;
  const csrfToken =
    await ensureCsrfToken();

  const response = await fetch(
    `${API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "X-CSRF-Token":
          csrfToken,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      clearCsrfToken();
    }

    throw new Error(
      "Refresh token request failed."
    );
  }

  let result: RefreshResponse;

  try {
    result =
      (await response.json()) as RefreshResponse;

    if (
      requestGeneration !==
      refreshGeneration
    ) {
      throw staleRefreshError();
    }

    setCsrfTokenFromResponse(
      result.csrfToken,
      result.csrfExpiresAt,
    );
  } catch (error) {
    clearCsrfToken();
    throw error;
  }

  if (
    requestGeneration !== refreshGeneration
  ) {
    throw staleRefreshError();
  }

  setAccessToken(
    result.accessToken
  );

  return result.accessToken;
}

export function refreshAccessToken(): Promise<string> {
  if (sessionRevocationDepth > 0) {
    return Promise.reject(
      new Error(
        "Refresh is unavailable while sessions are being revoked.",
      ),
    );
  }

  if (!refreshPromise) {
    refreshPromise =
      requestAccessToken().finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}
