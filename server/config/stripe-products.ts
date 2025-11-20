/**
 * Configuração de Produtos e Preços do Stripe
 * 
 * Price IDs devem ser configurados nas variáveis de ambiente:
 * - STRIPE_PRICE_BASIC
 * - STRIPE_PRICE_PRO
 * - STRIPE_PRICE_EXTRA
 */

import { ENV } from '../_core/env';

export const STRIPE_PRODUCTS = {
  BASIC: {
    name: 'Arqrender Basic',
    priceId: ENV.stripePriceBasic || '',
    price: 9990, // R$ 99,90 em centavos
    currency: 'brl',
    interval: 'month' as const,
    features: {
      monthlyQuota: 100,
      quality: 'hd' as const, // Qualidade HD (compressão aplicada)
      highResDownload: false,
    },
  },
  PRO: {
    name: 'Arqrender Pro',
    priceId: ENV.stripePricePro || '',
    price: 14990, // R$ 149,90 em centavos
    currency: 'brl',
    interval: 'month' as const,
    features: {
      monthlyQuota: 170,
      quality: 'max' as const, // Qualidade máxima (sem compressão)
      highResDownload: true,
    },
  },
  EXTRA: {
    name: 'Arqrender - Pacote Extra',
    priceId: ENV.stripePriceExtra || '',
    price: 4990, // R$ 49,90 em centavos
    currency: 'brl',
    type: 'one_time' as const,
    features: {
      renders: 20, // 20 renderizações adicionais
    },
  },
} as const;

export type PlanType = 'free' | 'basic' | 'pro';
export type QualityType = 'hd' | 'max';

/**
 * Mapeia plan type para configuração do produto
 */
export function getPlanConfig(plan: PlanType) {
  switch (plan) {
    case 'basic':
      return STRIPE_PRODUCTS.BASIC;
    case 'pro':
      return STRIPE_PRODUCTS.PRO;
    case 'free':
    default:
      return {
        name: 'Free',
        monthlyQuota: 0,
        quality: 'hd' as const,
        highResDownload: false,
      };
  }
}

/**
 * Mapeia Price ID para plan type
 */
export function getPlanFromPriceId(priceId: string): PlanType {
  if (priceId === STRIPE_PRODUCTS.BASIC.priceId) return 'basic';
  if (priceId === STRIPE_PRODUCTS.PRO.priceId) return 'pro';
  return 'free';
}

/**
 * Valida se todos os Price IDs estão configurados
 */
export function validateStripeConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!STRIPE_PRODUCTS.BASIC.priceId) missing.push('STRIPE_PRICE_BASIC');
  if (!STRIPE_PRODUCTS.PRO.priceId) missing.push('STRIPE_PRICE_PRO');
  if (!STRIPE_PRODUCTS.EXTRA.priceId) missing.push('STRIPE_PRICE_EXTRA');
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

