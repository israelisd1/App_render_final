/**
 * Hook para detectar qual sistema de autenticação está ativo
 */

import { useState, useEffect } from 'react';

export type AuthProvider = 'manus' | 'nextauth';

export function useAuthProvider(): AuthProvider | null {
  const [provider, setProvider] = useState<AuthProvider | null>(null);

  useEffect(() => {
    async function fetchAuthProvider() {
      try {
        const response = await fetch('/api/trpc/systemConfig.getAuthProvider');
        const data = await response.json();
        setProvider(data.result?.data?.json || data.result?.data || 'manus');
      } catch (error) {
        console.error('[useAuthProvider] Failed to fetch auth provider:', error);
        setProvider('manus'); // Fallback para Manus
      }
    }

    fetchAuthProvider();
  }, []);

  return provider;
}

