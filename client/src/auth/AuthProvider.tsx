import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  AuthContextType,
  AuthUser,
} from "./types";

import { AuthContext } from "./context/AuthContext";

import {
  clearTokens,
  getAccessToken,
  setAccessToken,
} from "./utils/tokenStorage";

import { useInitializeAuth } from "./hooks/useInitializeAuth";
import { clearCsrfToken } from "./services/csrf.api";
import {
  invalidateRefreshAccess,
} from "./services/refresh.api";

interface Props {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [token, setToken] =
    useState<string | null>(() =>
      getAccessToken()
    );

  const login = useCallback(
    (
      accessToken: string,
      authenticatedUser: AuthUser
    ) => {
      setAccessToken(accessToken);

      setToken(accessToken);
      setUser(authenticatedUser);
    },
    []
  );

  const logout = useCallback(() => {
    invalidateRefreshAccess();
    clearTokens();
    clearCsrfToken();

    setToken(null);
    setUser(null);
  }, []);

  const initializing =
    useInitializeAuth(
      login,
      logout
    );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated:
        token !== null &&
        user !== null,
      initializing,
      login,
      logout,
    }),
    [
      user,
      token,
      initializing,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
