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

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(
  payload: LoginRequest
): Promise<AuthResponse> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Login failed.");
  }

  return response.json();
}

export async function register(
  payload: RegisterRequest
) {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Registration failed.");
  }

  return response.json();
}