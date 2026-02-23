export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};

export type AuthContextValue = AuthState & {
  setToken: (token: string) => void;
  logout: () => void;
};