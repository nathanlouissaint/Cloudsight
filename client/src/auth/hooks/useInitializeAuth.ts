import {
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "../services/me.api";
import { refreshAccessToken } from "../services/refresh.api";

import type {
  AuthUser,
} from "../types";

export function useInitializeAuth(
  login: (
    token: string,
    user: AuthUser
  ) => void,
  logout: () => void,
) {
  const [
    initializing,
    setInitializing,
  ] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        const accessToken =
          await refreshAccessToken();

        const user =
          await getCurrentUser();

        login(accessToken, user);
      } catch {
        logout();
      } finally {
        setInitializing(false);
      }
    }

    void initialize();
  }, [
    login,
    logout,
  ]);

  return initializing;
}
