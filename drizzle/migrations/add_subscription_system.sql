-- Migração: Adicionar Sistema de Assinaturas
-- Data: 2025-10-28
-- Descrição: Adiciona campos de assinatura à tabela users para suportar modelo de assinatura mensal

-- Adicionar campos de assinatura
ALTER TABLE users ADD COLUMN stripeCustomerId VARCHAR(255);
ALTER TABLE users ADD COLUMN subscriptionId VARCHAR(255);
ALTER TABLE users ADD COLUMN subscriptionStatus ENUM('active', 'canceled', 'past_due', 'inactive') DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN plan ENUM('free', 'basic', 'pro') DEFAULT 'free' NOT NULL;
ALTER TABLE users ADD COLUMN monthlyQuota INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN monthlyRendersUsed INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN extraRenders INT DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN billingPeriodStart TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN billingPeriodEnd TIMESTAMP NULL;

-- Migrar usuários existentes
-- Usuários com tokens > 0 ganham plano free temporário
UPDATE users 
SET plan = 'free',
    monthlyQuota = 0,
    subscriptionStatus = 'inactive'
WHERE plan IS NULL OR plan = '';

-- Comentário: Sistema de tokens (tokenBalance) mantido por compatibilidade
-- Será removido em versão futura após migração completa

