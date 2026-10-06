import {
  createContext,
  useContext,
} from "react";
import type { AuthCredentials } from "../spend-guard/auth.api";
import type { AuthUser } from "./auth.store";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(credentials: AuthCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
}

export const AuthContext =
  createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
