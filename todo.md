# Project TODO

## Funcionalidades Implementadas

- [x] Sistema de renderização com Renderização Avançada via RapidAPI
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
- [x] Corrigir preview da aplicação (servidor não inicia)
  - [x] Desabilitar temporariamente NextAuth (problema com imports)
  - [x] Fazer servidor iniciar corretamente
  - [x] Testar preview funcionando - APLICAÇÃO FUNCIONAL!
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
  - [ ] Corrigir imports do next-auth (GoogleProvider e CredentialsProvider)
  - [ ] Reabilitar NextAuth routes no servidor
  - [ ] Testar login com Google
  - [ ] Testar cadastro com email/senha
  
- [x] Corrigir orientação das setas do slider na página principal
  - [x] Setas devem estar na horizontal (não vertical)
  - [x] Ajustar SVG do slider (BeforeAfterSlider.tsx)
- [x] Atualizar documentação
  - [x] Revisar README.md
  - [x] Adicionar índice e badges
  - [x] Consolidar informações de todos os guias
  - [x] Adicionar tabelas de custos
  - [x] Atualizar instruções de deploy
- [ ] Remover mençõ- [x] Remover menções a "IA" em todos os textos
  - [x] Substituir por "renderização avançada"
  - [x] Atualizar frontend (traduções PT-BR/EN)
  - [x] Atualizar documentação (README, guias) - 12 arquivos .md
  - [x] Meta tags usam VITE_APP_TITLE (sem hardcode)
- [ ] Implementar novo modelo de assinatura
  - [x] FASE 2: Atualizar schema do banco
    - [x] Adicionar campos de assinatura (subscription_id, plan, quota)
    - [x] Criar migração SQL
    - [x] Aplicar migração no banco (9 campos adicionados)
  - [x] FASE 3: Configurar produtos no Stripe
    - [x] Criar guia de configuração (STRIPE_PRODUCTS_SETUP.md)
    - [x] Criar arquivo de constantes (stripe-products.ts)
    - [x] Solicitar Price IDs do usuário
    - [x] Configurar variáveis de ambiente
  - [x] FASE 4: Backend - Lógica de assinatura
    - [x] Funções de banco (canUserRender, decrementQuota, etc) - 8 funções
    - [x] Rotas de assinatura (create, cancel, buy-extra, reactivate, status, portal)
    - [x] Webhook handler do Stripe (6 eventos processados)
    - [x] Implementar cancelamento no final do ciclo (cancel_at_period_end)
    - [x] Integrar rotas no servidor principal
  - [x] FASE 5: Controle de qualidade de imagem
    - [x] Investigar documentação RapidAPI (parâmetro quality confirmado)
    - [x] Atualizar API para usar quality="standard" (Basic) ou "detailed" (Pro)
    - [x] Instalar Sharp para compressão de imagens
    - [x] Implementar compressão para HD (1920x1080) no plano Basic
    - [x] Manter qualidade máxima para plano Pro (sem compressão)
    - [x] Adicionar campo quality ao schema de renders
    - [x] Atualizar frontend com botão HD condicional (apenas Pro)
    - [x] Adicionar traduções PT-BR/EN para botão HD
    - [x] Criar guia de testes (QUALITY_CONTROL_TESTING.md)
  - [x] FASE 6: Frontend - Páginas de assinatura
    - [x] Criar página de Pricing (/pricing)
    - [x] Criar página de gerenciamento de assinatura (/subscription)
    - [x] Adicionar indicadores de plano no header (badge Basic/Pro)
    - [x] Implementar fluxo de upgrade/downgrade
    - [x] Integrar botões com Stripe Checkout
    - [x] Adicionar traduções PT-BR/EN completas
    - [x] Adicionar rotas no App.tsx
  - [x] FASE 7: Traduções
    - [x] Revisar consistência de traduções PT-BR/EN
    - [x] Verificar que todas as chaves estão balanceadas
    - [x] 100% das chaves traduzidas em ambos idiomas
  - [x] FASE 8: Testes e validação
    - [x] Criar guia de testes end-to-end (TESTING_GUIDE.md)
    - [x] Criar guia do usuário (USER_GUIDE_SUBSCRIPTIONS.md)
    - [x] Documentar 20 cenários de teste
    - [x] Incluir checklist de funcionalidades críticas
- [ ] Implementar compra de pacotes extras
  - [ ] Múltiplos de 20 imagens por R$49,90
  - [ ] Respeitar resolução do plano principal
  - [ ] Criar interface de compra
  - [ ] Integrar com Stripe
- [x] Implementar controle de qualidade de imagem
  - [x] Investigar parâmetro quality da RapidAPI (confirmado: "standard" ou "detailed")
  - [x] Usar quality baseado no plano (standard para Basic, detailed para Pro)
  - [x] Comprimir saída para HD no plano Basic (1920x1080, Sharp)
  - [x] Manter qualidade máxima no plano Pro (sem compressão)
  - [x] Ocultar botão download alta res para Basic
  - [x] Mostrar botão "Download Alta Resolução (Pro)" apenas para plano Pro
  - [x] Adicionar traduções PT-BR/EN

## NOTA IMPORTANTE:
NextAuth está 90% implementado mas DESABILITADO devido a erro de import.
Aplicação funciona perfeitamente com OAuth da Manus.

Para finalizar NextAuth:
1. Investigar exports corretos do next-auth 4.24.11
2. Corrigir imports em server/auth/nextauth.config.ts
3. Descomentar registerAuthRoutes() em server/_core/index.ts
4. Adicionar rotas /login, /signup, /forgot-password no App.tsx



## Correções Concluídas

- [x] Corrigir sistema de download HD
  - [x] Adicionar campo highResUrl ao schema de renders
  - [x] Salvar URL original da API separadamente para plano Pro
  - [x] Criar função de download HD que usa highResUrl
  - [x] Botão HD agora baixa versão de alta resolução real (maior tamanho)



## Correção Final - Router Subscription (05/11/2025)

- [x] Corrigir router subscription faltante no backend
  - [x] Implementar procedure `status` (retorna dados da assinatura)
  - [x] Implementar procedure `cancel` (cancela assinatura via Stripe)
  - [x] Implementar procedure `reactivate` (reativa assinatura cancelada)
  - [x] Implementar procedure `portal` (abre portal do Stripe)
  - [x] Testar página /subscription carregando corretamente
  - [x] Testar página /pricing carregando corretamente
  - [x] Validar todas as rotas via navegador automatizado
  - [x] Confirmar servidor acessível publicamente



## Implementação de Renderizações Gratuitas (05/11/2025 23:00)

- [x] Implementar 3 renderizações gratuitas para novos usuários
  - [x] Atualizar db.ts para dar 3 renders gratuitos em extraRenders ao criar usuário
  - [x] Atualizar lógica de canUserRender para considerar extraRenders
  - [x] Atualizar Header.tsx para mostrar renders gratuitos restantes
  - [x] Atualizar traduções CTA para falar de 3 renders gratuitos
  - [x] Atualizar Home.tsx para mostrar CTA de cadastro gratuito
  - [x] Remover rota /tokens e arquivo TokensPage.tsx
  - [x] Remover links "Comprar Tokens" do Header
  - [x] Testar fluxo completo via navegador - SUCESSO!



## PROBLEMA CRÍTICO: Preview não carrega (05/11/2025 23:05)

- [ ] Diagnosticar causa raiz do problema de preview
  - [ ] Verificar logs do servidor em tempo real
  - [ ] Verificar erros de compilação TypeScript
  - [ ] Verificar erros de ESBuild no backend
  - [ ] Verificar se servidor está escutando corretamente
  - [ ] Verificar se há erros de sintaxe bloqueando build
  - [ ] Testar todas as rotas via curl
  - [ ] Validar que aplicação funciona via navegador



## Ajuste de Botões de Download (05/11/2025 23:12)

- [x] Ajustar botões de download no histórico por plano
  - [x] Plano Pro: mostrar apenas 1 botão "Baixar Imagem (Ultra HD)" em destaque
  - [x] Plano Basic/Free: mostrar 2 botões
    - [x] Botão 1: "Baixar Imagem" (padrão, funcional)
    - [x] Botão 2: "Download Alta Resolução (Pro)" (desabilitado, cinza, com tooltip)
  - [x] Adicionar traduções para tooltip "Disponível apenas no Plano Pro"
  - [x] Testar com plano Pro - SUCESSO!
  - [x] Testar com plano Basic - SUCESSO!




## Migração NextAuth - Forçada com Rollback (06/11/2025)

- [x] FASE 1: Sistema de Feature Flag para Rollback
  - [x] Criar tabela system_settings no banco
  - [x] Adicionar campo auth_provider (manus/nextauth)
  - [x] Criar interface admin para alternar sistemas
  - [x] Implementar middleware de seleção de auth
  
- [x] FASE 2: Correção de Imports NextAuth (CANCELADO - incompatibilidade ESM/CommonJS)

## Migração para Lucia Auth (Alternativa ao NextAuth)

- [x] FASE 2B: Autenticação Customizada (Arctic + JWT)
  - [x] Desinstalar next-auth
  - [x] Instalar arctic (Google OAuth) + jsonwebtoken + cookie-parser
  - [x] Criar módulo customAuth.ts com todas as rotas
  - [x] Implementar signup, signin, signout, session
  - [x] Implementar Google OAuth com Arctic
  - [x] Implementar forgot/reset password
  - [x] Integrar com servidor Express
  - [x] Testar todos os endpoints - SUCESSO!
  - [ ] Investigar exports corretos do next-auth 4.24.11
  - [ ] Corrigir import do GoogleProvider
  - [ ] Testar imports sem erros
  - [ ] Configurar NEXTAUTH_SECRET e NEXTAUTH_URL
  
- [ ] FASE 3: Configuração Google OAuth
  - [ ] Obter Google Client ID do Google Cloud Console
  - [ ] Obter Google Client Secret
  - [ ] Configurar variáveis de ambiente
  - [ ] Testar autenticação Google
  
- [ ] FASE 4: Habilitar Rotas NextAuth
  - [ ] Descomentar registerAuthRoutes() no servidor
  - [ ] Testar endpoints /api/auth/*
  - [ ] Validar signup, signin, session
  
- [ ] FASE 5: Migração de Usuários Existentes
  - [ ] Criar script de migração openId → email
  - [ ] Marcar usuários Manus com provider='manus'
  - [ ] Forçar reset de senha para usuários Manus
  - [ ] Enviar emails de notificação (mock)
  
- [ ] FASE 6: Atualização do Frontend
  - [ ] Adicionar rotas /login, /signup, /forgot-password no App.tsx
  - [ ] Criar hook useNextAuth
  - [ ] Substituir useAuth por useNextAuth em todos os componentes
  - [ ] Atualizar Header.tsx
  - [ ] Atualizar RenderPage.tsx
  - [ ] Atualizar HistoryPage.tsx
  - [ ] Atualizar SubscriptionPage.tsx
  
- [ ] FASE 7: Sistema de Emails
  - [ ] Decidir: SMTP real ou mock
  - [ ] Configurar nodemailer (se SMTP)
  - [ ] Criar templates de email
  - [ ] Testar envio de verificação
  - [ ] Testar envio de reset de senha
  
- [ ] FASE 8: Testes End-to-End
  - [ ] Testar cadastro com email/senha
  - [ ] Testar login com email/senha
  - [ ] Testar login com Google
  - [ ] Testar reset de senha
  - [ ] Testar fluxo de assinatura com NextAuth
  - [ ] Testar renderizações com NextAuth
  - [ ] Testar rollback via painel admin
  
- [ ] FASE 9: Desativação OAuth Manus
  - [ ] Alterar feature flag para nextauth
  - [ ] Monitorar logs por 24h
  - [ ] Confirmar zero erros
  - [ ] Remover código OAuth Manus (opcional)




## Correção Painel Admin (06/11/2025)

- [x] Corrigir exibição do sistema ativo no painel admin
  - [x] Verificar valor padrão no banco (deve ser 'manus' não 'nextauth')
  - [x] Atualizar lógica de exibição para mostrar sistema correto
  - [x] Testar alternância entre sistemas




## Páginas de Autenticação Frontend (06/11/2025)

- [x] Criar páginas de autenticação com detecção automática do sistema ativo
  - [x] Página de Login (/login)
  - [x] Página de Signup (/signup)
  - [x] Página de Forgot Password (/forgot-password)
  - [x] Página de Reset Password (/reset-password)
  - [x] Hook useCustomAuth criado
  - [x] Lógica de redirecionamento baseada em auth_provider
  - [x] Registrar rotas no App.tsx
  - [x] Testar com OAuth Manus - redireciona corretamente
  - [x] Testar com NextAuth customizado - formulário funcionando!

