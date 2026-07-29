import { useEffect, useState } from "react";

import { getCurrentUser } from "../services/me.api";

export function useInitializeAuth(
  token: string | null,
  login: (token: string, user: any) => void,
  logout: () => void,
) {
  const [initializing, setInitializing] =
    useState(true);

  useEffect(() => {
    async function initialize() {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const user =
          await getCurrentUser();

        login(token, user);
      } catch {
        logout();
      } finally {
        setInitializing(false);
      }
    }

    void initialize();
  }, [token, login, logout]);

  return initializing;
}
