import {
  apiRequest,
} from "../api/client";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function registerSpendGuardUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",

      body: {
        email,
        password,
      },
    },
  );
}
