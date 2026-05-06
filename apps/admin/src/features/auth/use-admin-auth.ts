import { useState, useEffect, useCallback } from 'react';
import { httpClient } from '@/shared/api/http-client';
import type { AdminUser } from '@/shared/api/types';

interface AuthState {
  readonly user: AdminUser | null;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
}

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>(() => {
    if (!httpClient.hasToken()) {
      return { user: null, isLoading: false, isAuthenticated: false };
    }
    return { user: null, isLoading: true, isAuthenticated: false };
  });

  useEffect(() => {
    if (!httpClient.hasToken()) return;

    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await httpClient.get<AdminUser>('/users/me');

        if (cancelled) return;

        if (res.success && res.data) {
          const user = res.data;
          if (user.role === 'admin' || user.role === 'super_admin') {
            setState({ user, isLoading: false, isAuthenticated: true });
          } else {
            httpClient.clearToken();
            setState({ user: null, isLoading: false, isAuthenticated: false });
          }
        } else {
          httpClient.clearToken();
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } catch {
        if (!cancelled) {
          httpClient.clearToken();
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      }
    }

    void checkAuth();

    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await httpClient.post<{
      user: AdminUser;
      tokens: { accessToken: string; refreshToken: string };
    }>('/auth/signin', { email, password });

    if (res.success && res.data) {
      const { user, tokens } = res.data;
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return { success: false as const, error: 'Access denied. Admin role required.' };
      }
      httpClient.setToken(tokens.accessToken);
      setState({ user, isLoading: false, isAuthenticated: true });
      return { success: true as const, user };
    }

    return { success: false as const, error: res.error ?? 'Login failed' };
  }, []);

  const signOut = useCallback(() => {
    httpClient.post('/auth/signout').catch(() => {});
    httpClient.clearToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    window.location.href = '/login';
  }, []);

  return { ...state, signIn, signOut };
}
