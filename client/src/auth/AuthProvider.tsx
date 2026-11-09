import {
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import { analytics } from "../lib/analytics";
import {
  loginAuth,
  logoutAuth,
  refreshAuth,
} from "../spend-guard/auth.api";
import { authStore } from "./auth.store";
import { AuthContext } from "./auth.context";
import type { AuthContextValue } from "./auth.context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    authStore.subscribe,
    authStore.getSnapshot,
    authStore.getSnapshot,
  );

  useEffect(() => {
    if (authStore.getState().status !== "loading") {
      return;
    }

    void refreshAuth().catch(() => {
      authStore.clear();
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: state.user,
    isAuthenticated: state.status === "authenticated",
    isLoading: state.status === "loading",
    async login(credentials) {
      const response = await loginAuth(credentials);
      authStore.setAuthenticated(response.accessToken, response.user);
      return response.user;
    },
    async logout() {
      try {
        await logoutAuth();
      } finally {
        authStore.clear();
        analytics.reset();
      }
    },
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
