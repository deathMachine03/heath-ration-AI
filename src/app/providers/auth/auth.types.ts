export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
};

export type AuthContextValue = AuthState & {
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
};