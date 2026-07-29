import type { AuthUser } from "./types";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:5001";

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
  refreshToken: string;
  user: AuthUser;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
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
  const response = await fetch(
    `${API_URL}/auth/login`,
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
        "Login failed."
      )
    );
  }

  const result =
    (await response.json()) as BackendLoginResponse;

  return {
    token: result.accessToken,
    refreshToken: result.refreshToken,
    user: result.user,
  };
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
