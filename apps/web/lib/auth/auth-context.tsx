'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { authClient, type AuthUser, type AuthResponse } from './auth-client';

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly signIn: (email: string, password: string) => Promise<AuthResponse>;
  readonly signUp: (data: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
  }) => Promise<AuthResponse>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authClient.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await authClient.getProfile();
        if (cancelled) return;

        if (res.success && res.data) {
          setUser(res.data);
        } else {
          authClient.clearToken();
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          authClient.clearToken();
          setUser(null);
        }
      }
      if (!cancelled) setIsLoading(false);
    }

    void checkAuth();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const res = await authClient.signIn({ email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const signUp = useCallback(async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const res = await authClient.signUp(data);
    if (res.success && res.data) {
      setUser(res.data.user);
    }
    return res;
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await authClient.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, signIn, signUp, signOut }),
    [user, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
