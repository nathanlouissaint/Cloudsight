export interface AuthUser {
  id: string;
  email: string;
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