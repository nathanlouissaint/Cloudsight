import type { AuthUser } from "./types";
import {
  clearCsrfToken,
  ensureCsrfToken,
  setCsrfTokenFromResponse,
} from "./services/csrf.api";
import {
  beginSessionRevocation,
  endSessionRevocation,
} from "./services/refresh.api";
import {
  setOAuthReturnTo,
} from "./utils/oauthReturnTo";

const API_URL =
  import.meta.env?.VITE_API_URL ??
  "http://localhost:5001";

export function startGoogleLogin(
  returnTo = "/",
): void {
  setOAuthReturnTo(returnTo);

  window.location.assign(
    `${API_URL}/auth/oauth/google/start`,
  );
}

export function startMicrosoftLogin(
  returnTo = "/",
): void {
  setOAuthReturnTo(returnTo);

  window.location.assign(
    `${API_URL}/auth/oauth/microsoft/start`,
  );
}

export function startGitHubLogin(
  returnTo = "/",
): void {
  setOAuthReturnTo(returnTo);

  window.location.assign(
    `${API_URL}/auth/oauth/github/start`,
  );
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

interface BackendLoginResponse {
  accessToken: string;
  user: AuthUser;
  csrfToken: unknown;
  csrfExpiresAt: unknown;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await response.json();

    if (
      typeof body?.message === "string"
    ) {
      return body.message;
    }
  } catch {
    // Use the fallback message.
  }

  return fallback;
}

export async function login(
  payload: LoginRequest
): Promise<AuthResponse> {
  const csrfToken =
    await ensureCsrfToken();

  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        "X-CSRF-Token":
          csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      clearCsrfToken();
    }

    throw new Error(
      await getErrorMessage(
        response,
        "Login failed."
      )
    );
  }

  const result =
    (await response.json()) as BackendLoginResponse;

  setCsrfTokenFromResponse(
    result.csrfToken,
    result.csrfExpiresAt,
  );

  return {
    token: result.accessToken,
    user: result.user,
  };
}

export async function logout(): Promise<void> {
  await beginSessionRevocation();

  try {
    const csrfToken = await ensureCsrfToken();

    const response = await fetch(
      `${API_URL}/auth/logout`,
      {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        clearCsrfToken();
      }
      throw new Error(
        await getErrorMessage(
          response,
          "Logout failed."
        )
      );
    }
  } finally {
    endSessionRevocation();
  }
}

export async function register(
  payload: RegisterRequest
): Promise<AuthUser> {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Registration failed."
      )
    );
  }

  return response.json();
}
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<{ message: string }> {
  const response = await fetch(
    `${API_URL}/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to process password reset request."
      )
    );
  }

  return response.json();
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<unknown> {
  const response = await fetch(
    `${API_URL}/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to reset password."
      )
    );
  }

  return response.json();
}

export async function verifyEmail(token: string): Promise<unknown> {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to verify email."));
  }
  return response.json();
}

export async function resendVerification(): Promise<{ message: string }> {
  const csrfToken = await ensureCsrfToken();
  const accessToken = localStorage.getItem("cloudsight.accessToken");
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
      "X-CSRF-Token": csrfToken,
    },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to resend verification email."));
  }
  return response.json();
}
