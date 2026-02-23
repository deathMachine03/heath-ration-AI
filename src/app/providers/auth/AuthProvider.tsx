import { useMemo, useState } from "react";
import { AuthContext } from "./auth.context";
import { tokenStorage } from "../../../shared/lib/storage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => tokenStorage.get());

  const value = useMemo(() => {
    const setToken = (t: string) => {
      tokenStorage.set(t);
      setTokenState(t);
    };

    const logout = () => {
      tokenStorage.remove();
      setTokenState(null);
    };

    return {
      token,
      isAuthenticated: Boolean(token),
      setToken,
      logout,
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}