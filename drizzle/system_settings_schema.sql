-- Tabela de configurações do sistema para feature flags
-- Permite alternar entre OAuth Manus e NextAuth via painel admin

CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(320) -- email do admin que fez a alteração
);

-- Inserir configuração padrão (NextAuth ativo)
INSERT INTO system_settings (setting_key, setting_value, description) 
VALUES ('auth_provider', 'nextauth', 'Sistema de autenticação ativo: manus ou nextauth')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- Índice para busca rápida
CREATE INDEX idx_setting_key ON system_settings(setting_key);

