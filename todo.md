# Project TODO

## Funcionalidades Implementadas

- [x] Sistema de renderização com IA via RapidAPI
- [x] Upload de imagens 2D
- [x] Sistema de tokens (compra e consumo)
- [x] Integração com Stripe para pagamentos
- [x] Histórico de renderizações
- [x] Sistema de ajustes visuais (saturação, brilho, contraste, iluminação)
- [x] Preview em tempo real dos ajustes
- [x] Internacionalização PT-BR/EN
- [x] Painel administrativo
- [x] Sistema de cupons de desconto
- [x] Slider antes/depois na home

## Funcionalidades Pendentes

- [ ] Sistema de autenticação próprio (substituir OAuth Manus)
  - [ ] Login com Google OAuth
  - [ ] Cadastro com email e senha
  - [ ] Recuperação de senha
  - [ ] Perfil de usuário editável
- [x] Download de imagens renderizadas em alta resolução
  - [x] Botão de download no card de renderização
  - [x] Download direto do S3
  - [x] Nome de arquivo descritivo
- [x] Rebranding para "Arqrender"
  - [x] Atualizar nome no frontend (títulos, headers, meta tags)
  - [x] Atualizar variáveis de ambiente (VITE_APP_TITLE)
  - [x] Atualizar traduções PT-BR/EN
  - [x] Atualizar documentação (README, guias)
  - [x] Atualizar nome de arquivos de download
- [x] Criar guia único de instalação usando App Platform
  - [x] Consolidar todos os passos em documento sequencial
  - [x] Incluir setup de GitHub
  - [x] Incluir setup de banco PostgreSQL (Managed Database)
  - [x] Incluir setup de Spaces (S3)
  - [x] Incluir setup de variáveis de ambiente
  - [x] Incluir setup de Google OAuth
  - [x] Incluir setup de Stripe
  - [x] Incluir setup de RapidAPI
  - [x] Incluir setup de domínio customizado
- [x] Criar script de deploy automatizado para App Platform
  - [x] Script de criação inicial do app (app.yaml)
  - [x] Script de atualização de variáveis de ambiente
  - [x] Script de deploy/redeploy
  - [x] Documentação de uso dos scripts
- [ ] Implementar NextAuth no código
  - [x] Instalar dependências (next-auth, bcryptjs, nodemailer)
  - [x] Criar rotas de autenticação (/api/auth/*)
  - [x] Criar páginas de login e registro
    - [x] Página de login (LoginPage.tsx)
    - [x] Página de registro (SignupPage.tsx)
    - [x] Página de recuperação de senha (ForgotPasswordPage.tsx)
  - [x] Atualizar schema do banco para usuários
  - [x] Aplicar migração no banco de dados
  - [x] Corrigir erros TypeScript (loginMethod → provider)
  - [x] Criar configuração NextAuth (nextauth.config.ts)
  - [x] Adicionar funções de banco para NextAuth (db.ts)
  - [x] Criar tipos TypeScript para NextAuth
  - [x] Adicionar traduções PT-BR/EN para auth
  - [x] Integrar NextAuth no servidor principal (server/_core/index.ts)
  - [ ] Adicionar rotas no App.tsx
  - [ ] Substituir OAuth da Manus por NextAuth (opcional - manter ambos)
  - [ ] Testar login com Google
  - [ ] Testar cadastro com email/senha

