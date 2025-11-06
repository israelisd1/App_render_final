import { Request, Response, NextFunction } from "express";
import { getAuthProvider } from "../systemSettings";

/**
 * Middleware que seleciona o sistema de autenticação baseado em feature flag
 * Permite rollback instantâneo entre OAuth Manus e NextAuth
 */

let cachedAuthProvider: "manus" | "nextauth" | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5000; // 5 segundos

/**
 * Obter provider de autenticação com cache
 */
export async function getCachedAuthProvider(): Promise<"manus" | "nextauth"> {
  const now = Date.now();
  
  // Atualizar cache se expirou
  if (!cachedAuthProvider || now - lastCacheUpdate > CACHE_TTL) {
    cachedAuthProvider = await getAuthProvider();
    lastCacheUpdate = now;
    console.log(`[AuthMiddleware] Auth provider: ${cachedAuthProvider}`);
  }
  
  return cachedAuthProvider;
}

/**
 * Limpar cache (útil após mudança de configuração)
 */
export function clearAuthProviderCache() {
  cachedAuthProvider = null;
  lastCacheUpdate = 0;
  console.log("[AuthMiddleware] Cache cleared");
}

/**
 * Middleware que adiciona informação do provider ativo à requisição
 */
export async function authProviderMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provider = await getCachedAuthProvider();
    (req as any).authProvider = provider;
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error);
    // Em caso de erro, usar nextauth como padrão
    (req as any).authProvider = "nextauth";
    next();
  }
}

/**
 * Verificar se NextAuth está ativo
 */
export async function isNextAuthActive(): Promise<boolean> {
  const provider = await getCachedAuthProvider();
  return provider === "nextauth";
}

/**
 * Verificar se OAuth Manus está ativo
 */
export async function isManusAuthActive(): Promise<boolean> {
  const provider = await getCachedAuthProvider();
  return provider === "manus";
}

