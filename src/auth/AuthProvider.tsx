import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types/auth.types';
import * as authApi from '@/api/auth.api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'creator' | 'promoter') => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kyndo_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    authApi
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('kyndo_access_token');
        localStorage.removeItem('kyndo_refresh_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('kyndo_access_token', data.access_token);
    localStorage.setItem('kyndo_refresh_token', data.refresh_token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: 'creator' | 'promoter') => {
    await authApi.signup({ email, password, name, role });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem('kyndo_access_token');
    localStorage.removeItem('kyndo_refresh_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
