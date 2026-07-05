import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { authApi } from "@/lib/api/auth";
import { clearTokens, getTokens, setSessionExpiredHandler, setTokens } from "@/lib/api/client";
import type { Login, RegisterUser } from "@/lib/types";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export interface CurrentUser {
  id: number;
  email: string;
  roles: string[];
}

interface AuthContextValue {
  user: CurrentUser | null;
  isAdmin: boolean;
  login: (data: Login) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface TokenClaims {
  sub: string;
  email: string;
  [ROLE_CLAIM]?: string | string[];
}

function decodeUser(): CurrentUser | null {
  const tokens = getTokens();
  if (!tokens) {
    return null;
  }
  try {
    const claims = jwtDecode<TokenClaims>(tokens.accessToken);
    const roleClaim = claims[ROLE_CLAIM] ?? [];
    const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
    return { id: Number(claims.sub), email: claims.email, roles };
  } catch {
    clearTokens();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(decodeUser);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async (data: Login) => {
    const tokens = await authApi.login(data);
    setTokens(tokens);
    setUser(decodeUser());
  }, []);

  const register = useCallback(async (data: RegisterUser) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    const tokens = getTokens();
    if (tokens) {
      try {
        await authApi.logout(tokens);
      } catch {
        // best effort — clear locally regardless
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAdmin: user?.roles.includes("Admin") ?? false,
      login,
      register,
      logout,
    };
  }, [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
