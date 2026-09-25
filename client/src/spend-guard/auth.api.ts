import { apiRequest } from "../api/client";

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SpendGuardRegistration {
  email: string;
  password: string;
  name: string;
  company: string;
}

export async function registerSpendGuardUser(
  registration: SpendGuardRegistration,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: registration,
  });
}
