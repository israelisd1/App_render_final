/**
 * Hook de autenticação para NextAuth customizado
 */

import { useState, useEffect } from 'react';

export interface CustomAuthUser {
  id: number;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'basic' | 'pro';
  extraRenders: number;
  monthlyQuota: number;
  monthlyRendersUsed: number;
}

export interface UseCustomAuthReturn {
  user: CustomAuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
}

export function useCustomAuth(): UseCustomAuthReturn {
  const [user, setUser] = useState<CustomAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.user || null);
    } catch (err) {
      console.error('[useCustomAuth] Session check error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      setUser(data.user);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string, name?: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      setUser(data.user);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('[useCustomAuth] Logout error:', err);
    }
  }

  function loginWithGoogle() {
    window.location.href = '/api/auth/google';
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loginWithGoogle,
  };
}

