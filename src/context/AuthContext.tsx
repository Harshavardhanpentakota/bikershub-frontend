import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, ApiUser } from '@/lib/api';

// ── Types ────────────────────────────────────────────────────
interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'bh_token';
const USER_KEY  = 'bh_user';

// ── Provider ─────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<ApiUser | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on first load
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as ApiUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // ── Persist helpers ─────────────────────────────────────────
  const persist = (tok: string, u: ApiUser) => {
    localStorage.setItem(TOKEN_KEY, tok);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(tok);
    setUser(u);
  };

  const clear = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // ── Auth actions ─────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { token: tok, user: u } = await authApi.login({ email, password });
    persist(tok, u);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token: tok, user: u } = await authApi.register({ name, email, password });
    persist(tok, u);
  }, []);

  const logout = useCallback(() => {
    // Fire-and-forget the server call; always clear client-side state
    authApi.logout().catch(() => null);
    clear();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
