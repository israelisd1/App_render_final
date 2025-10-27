-- Migração para adicionar campos do NextAuth
-- Data: 2025-10-26

-- Adicionar novas colunas à tabela users
ALTER TABLE `users` 
  ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`,
  ADD COLUMN `provider` VARCHAR(64) NOT NULL DEFAULT 'email' AFTER `password`,
  ADD COLUMN `emailVerified` INT NOT NULL DEFAULT 0 AFTER `provider`,
  ADD COLUMN `verificationToken` VARCHAR(255) NULL AFTER `emailVerified`,
  ADD COLUMN `resetPasswordToken` VARCHAR(255) NULL AFTER `verificationToken`,
  ADD COLUMN `resetPasswordExpires` TIMESTAMP NULL AFTER `resetPasswordToken`;

-- Tornar openId opcional (remover NOT NULL)
ALTER TABLE `users` 
  MODIFY COLUMN `openId` VARCHAR(64) NULL;

-- Adicionar índice único no email (se ainda não existir)
ALTER TABLE `users` 
  ADD UNIQUE INDEX `email_unique` (`email`);

-- Atualizar usuários existentes para usar provider 'manus'
UPDATE `users` 
SET `provider` = 'manus' 
WHERE `openId` IS NOT NULL;

-- Remover coluna loginMethod (não é mais necessária)
ALTER TABLE `users` 
  DROP COLUMN IF EXISTS `loginMethod`;

