import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, TOKEN_STORAGE_KEY } from '../api/client';
import type { AuthUser, Role } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<AuthUser>;
  register: (phone: string, password: string, name: string, role: Role) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'cleanmarket_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  function persistSession(accessToken: string, authUser: AuthUser) {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }

  async function login(phone: string, password: string) {
    const { data } = await api.post('/auth/login', { phone, password });
    persistSession(data.accessToken, data.user);
    return data.user as AuthUser;
  }

  async function register(phone: string, password: string, name: string, role: Role) {
    const { data } = await api.post('/auth/register', { phone, password, name, role });
    persistSession(data.accessToken, data.user);
    return data.user as AuthUser;
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, isLoading, login, register, logout }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
