import { useMemo, useState } from "react";
import { tokenStorage } from "@/shared/lib/storage";
import { AuthContext } from "./auth.context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => tokenStorage.getAccess());

  const value = useMemo(() => {
    const setTokens = (access: string, refresh: string) => {
      tokenStorage.setTokens(access, refresh);
      setAccessToken(access);
    };

    const logout = () => {
      tokenStorage.clear();
      setAccessToken(null);
    };

    return {
      token: accessToken,
      isAuthenticated: Boolean(accessToken),
      setTokens,
      logout,
    };
  }, [accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}