export interface AuthUser {
  id: string;
  email: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
}

type Listener = () => void;

let state: AuthState = {
  accessToken: null,
  user: null,
  status: "loading",
};

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const authStore = {
  getState: () => state,
  getSnapshot: () => state,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setAuthenticated(accessToken: string, user: AuthUser) {
    state = { accessToken, user, status: "authenticated" };
    emit();
  },
  setLoading() {
    state = { ...state, status: "loading" };
    emit();
  },
  clear() {
    state = { accessToken: null, user: null, status: "unauthenticated" };
    emit();
  },
  getAccessToken() {
    return state.accessToken;
  },
};
