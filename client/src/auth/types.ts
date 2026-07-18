export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  authProvider: "LOCAL" | "GOOGLE";
  avatarUrl: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (
    token: string,
    user: AuthUser
  ) => void;

  logout: () => void;
}