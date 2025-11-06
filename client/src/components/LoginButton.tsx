/**
 * Botão de login inteligente que detecta o sistema de autenticação ativo
 */

import { useState, useEffect } from 'react';
import { getLoginUrl, getLoginUrlAsync } from '@/const';

interface LoginButtonProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function LoginButton({ children, className, asChild }: LoginButtonProps) {
  const [loginUrl, setLoginUrl] = useState<string>(getLoginUrl());

  useEffect(() => {
    // Detectar URL de login correta baseada no auth provider
    getLoginUrlAsync().then(url => {
      setLoginUrl(url);
    });
  }, []);

  if (asChild) {
    // Se asChild, retornar apenas a URL para ser usada em outro componente
    return null;
  }

  return (
    <a href={loginUrl} className={className}>
      {children}
    </a>
  );
}

/**
 * Hook para obter URL de login dinâmica
 */
export function useLoginUrl(): string {
  const [loginUrl, setLoginUrl] = useState<string>(getLoginUrl());

  useEffect(() => {
    getLoginUrlAsync().then(url => {
      setLoginUrl(url);
    });
  }, []);

  return loginUrl;
}

