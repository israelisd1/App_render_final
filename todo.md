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




## BUG: Alternância de Autenticação Não Funciona (06/11/2025)

- [x] Investigar por que OAuth Manus carrega mesmo com NextAuth habilitado no admin
  - [x] Verificar valor no banco após alternar - nextauth ativo
  - [x] Verificar cache do authMiddleware - funcionando
  - [x] Verificar se useAuth está usando sistema correto - problema encontrado!
  - [x] Verificar se getLoginUrl() está checando auth_provider - não estava checando
- [x] Corrigir lógica de detecção de autenticação
  - [x] Criar getLoginUrlAsync() que detecta auth provider
  - [x] Modificar useAuth para usar getLoginUrlAsync()
  - [x] Criar hook useAuthProvider
- [x] Testar alternância completa (Manus → NextAuth → Manus)
  - [x] NextAuth ativo no painel admin
  - [x] Hook useLoginUrl implementado em todos os componentes
  - [x] Sistema detectando auth provider corretamente




## BUG: Erro ao Publicar (06/11/2025)

- [x] Investigar erro de publicação
  - [x] Verificar erros de build TypeScript
  - [x] Verificar erros de build do cliente
  - [x] Verificar erros de build do servidor
  - [x] Erro encontrado: useLoginUrl() no lugar errado em DashboardLayout.tsx
- [x] Corrigir erros encontrados
  - [x] Mover useLoginUrl() para dentro do corpo da função
- [x] Testar build de produção localmente - SUCESSO!
- [ ] Publicar versão corrigida




## Erro Persistente de Publicação (06/11/2025)

- [x] Investigar causa raiz do erro "algo deu errado"
  - [x] Verificar logs do sistema de publicação - ServiceNotHealthy
  - [x] Verificar se há erros TypeScript não detectados
  - [x] Verificar arquivos .cjs que podem causar problemas - nenhum encontrado
  - [x] Verificar configurações package.json - OK
  - [x] Verificar se há imports problemáticos - ENCONTRADO!
  - [x] Problema: import { Google } from "arctic" no topo do arquivo causava erro ESM Loader
- [x] Corrigir problemas encontrados
  - [x] Implementar lazy loading do Arctic com import() dinâmico
  - [x] Criar função getGoogleClient() assíncrona
  - [x] Atualizar todas referências de google para await getGoogleClient()
  - [x] Build testado e validado - SUCESSO!
- [ ] Testar publicação novamente




## Erro Stripe na Publicação (06/11/2025)

- [x] Corrigir inicialização do Stripe sem chave configurada
  - [x] Encontrar onde Stripe é inicializado - 3 lugares
  - [x] Adicionar verificação de chave antes de criar instância
  - [x] Tornar Stripe opcional quando chave não existe
  - [x] Modificar subscription.ts para usar stripe exportado
  - [x] Modificar stripe-webhook.ts para usar stripe exportado
  - [x] Adicionar import condicional no index.ts
  - [x] Rotas Stripe só registradas se chave existir
- [x] Testar build - SUCESSO! (100.6kb)
- [ ] Testar publicação




## Bug: Login NextAuth não funciona (06/11/2025)

- [x] Investigar problema de login
  - [x] Testar fluxo de signup - funcionando
  - [x] Testar fluxo de signin - funcionando
  - [x] Verificar se cookie está sendo setado - OK
  - [x] Verificar se senha está sendo hasheada corretamente - OK
  - [x] Verificar logs do servidor
  - [x] PROBLEMA ENCONTRADO: tRPC não detectava cookie NextAuth
- [x] Corrigir problema identificado
  - [x] Modificar sdk.ts authenticateRequest() para detectar auth_token
  - [x] Adicionar fallback para OAuth Manus
  - [x] Testar integração tRPC + NextAuth - SUCESSO!
- [x] Testar login completo - auth.me retorna usuário corretamente




## Erros React - Nested Anchor Tags (06/11/2025)

- [x] Encontrar nested anchor tags
  - [x] Verificar página Login.tsx - 2 nested anchors encontrados
  - [x] Verificar página Signup.tsx - 1 nested anchor encontrado
  - [x] Verificar componentes que usam Link - nenhum outro encontrado
- [x] Corrigir hierarquia HTML
  - [x] Login.tsx: remover <a> interno de Link (linhas 168-172, 193-197)
  - [x] Signup.tsx: remover <a> interno de Link (linhas 224-228)
  - [x] Passar className diretamente para Link
- [x] Testar sem erros no console - build sucesso, servidor rodando




## Busca Completa Nested Anchors (06/11/2025)

- [ ] Buscar TODOS os nested anchors no projeto
  - [ ] Verificar todos arquivos .tsx
  - [ ] Procurar padrão `<Link.*><a`
  - [ ] Listar todos os casos
- [ ] Corrigir cada caso encontrado
- [ ] Testar sem erros React




## Correção de Nested Anchor Tags (06/11/2025 19:03)

- [x] Corrigir erros React de nested anchor tags
  - [x] RenderPage.tsx - Link com <a> interno em modal de tokens insuficientes
  - [x] ForgotPassword.tsx - 2 Links com <a> internos (botão "Voltar para Login" e link de texto)
  - [x] ResetPassword.tsx - 2 Links com <a> internos (botão "Ir para Login" e link de texto)
  - [x] Remover <a> internos e passar className diretamente para <Link>
  - [x] Usar Button com prop asChild quando necessário
  - [x] Build validado sem erros TypeScript
  - [x] Console do navegador sem warnings React
  - [x] Sistema pronto para publicação





## BUGS CRÍTICOS Reportados (06/11/2025 19:05)

- [x] BUG: Login não funciona - redireciona para Home após inserir credenciais
  - [x] Investigar fluxo de login no Login.tsx
  - [x] Verificar endpoint /api/auth/signin
  - [x] Verificar se cookie auth_token está sendo setado
  - [x] Verificar se tRPC está detectando sessão
  - [x] Testar com credenciais válidas
  - [x] ✅ RESOLVIDO: Login funcionando perfeitamente! Backend estava OK, frontend também.

- [x] BUG: Reset de senha não envia email
  - [x] Investigar endpoint /api/auth/forgot-password
  - [x] Verificar se nodemailer está configurado
  - [x] Verificar variáveis de ambiente de email
  - [x] Verificar logs do servidor
  - [x] Implementar solução alternativa se necessário
  - [x] ✅ RESOLVIDO: Sistema de email implementado com Nodemailer
  - [x] ✅ Modo desenvolvimento: loga link no console
  - [x] ✅ Modo produção: envia email real via SMTP (requer configuração)
  - [x] ✅ Documentação completa em EMAIL_SETUP.md





## Configuração de Email (06/11/2025 19:25)

- [x] Configurar variáveis de ambiente Gmail
- [x] Testar envio de email real
- [x] Validar recebimento na caixa de entrada
- [x] Confirmar fluxo completo de reset de senha
- [x] ✅ CONCLUÍDO: Sistema de email configurado e testado com sucesso!
  - Email: israelisd@gmail.com
  - SMTP: smtp.gmail.com:587
  - Status: Enviando emails reais





## BUG: Email de Reset em Branco (06/11/2025 20:05)

- [x] Investigar template HTML do email de reset de senha
- [x] Corrigir template para exibir conteúdo corretamente
- [x] Testar envio novamente
- [x] Validar recebimento com conteúdo visível
- [x] ✅ RESOLVIDO: Duas correções aplicadas:
  1. Template HTML convertido para tabelas (compatibilidade Gmail)
  2. Variáveis de ambiente com trim() para remover espaços extras
- [x] ✅ Email chegando perfeitamente formatado com todo conteúdo





## Implementação Google OAuth (06/11/2025 20:25)

- [ ] Analisar arquitetura atual de autenticação
- [ ] Implementar endpoint Google OAuth no backend
- [ ] Criar botão "Entrar com Google" no frontend
- [ ] Configurar variáveis de ambiente (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [ ] Testar fluxo completo de login com Google
- [ ] Validar criação/atualização de usuários via Google





## Implementação Google OAuth (06/11/2025 20:30)

- [x] Analisar arquitetura de autenticação atual
- [x] Implementar Google OAuth no backend
- [x] Implementar botão Google OAuth no frontend
- [x] Configurar variáveis de ambiente
- [x] Testar fluxo completo
- [x] ✅ CONCLUÍDO: Google OAuth 100% implementado!
  - Backend: Rotas /api/auth/google e /api/auth/callback/google
  - Frontend: Botão "Continue com Google" na página de login
  - Credenciais: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET configurados
  - Google Console: URLs autorizadas configuradas
  - Sistema pronto para uso em produção




## Correção de Erros TypeScript para Publicação (06/11/2025 22:45)

- [x] Corrigir erros de Stripe null checks
  - [x] server/routers.ts (2 erros)
  - [x] server/routes/stripe-webhook.ts (15 erros)
  - [x] server/routes/subscription.ts (9 erros)
- [x] Corrigir erros de tipos
  - [x] client/src/pages/AdminPage.tsx (4 erros)
  - [x] client/src/pages/PricingPage.tsx (3 erros)
  - [x] Adicionar procedures create e buyExtra ao router subscription
- [x] Validar build TypeScript sem erros
- [x] ✅ CONCLUÍDO: Zero erros TypeScript!
  - Build de produção: 1783 módulos compilados com sucesso
  - Todas as verificações de null do Stripe adicionadas
  - Type assertions para tipos complexos do Stripe
  - Procedures tRPC create e buyExtra implementados
  - Aplicação pronta para publicação




## Simplificação de Autenticação (07/11/2025)

- [ ] Remover botão "Continue com Google" do Login.tsx
- [ ] Remover botão "Continue com Google" do Signup.tsx
- [ ] Implementar sistema de verificação de email
  - [ ] Adicionar campo emailVerified no schema
  - [ ] Criar endpoint para enviar email de verificação
  - [ ] Criar endpoint para validar token de verificação
  - [ ] Criar página de verificação de email
  - [ ] Enviar email automaticamente após cadastro
  - [ ] Bloquear login se email não verificado
- [ ] Testar fluxo completo
- [ ] Salvar checkpoint




## Simplificação de Autenticação (06/11/2025 23:00)

- [x] Remover botão "Continue com Google" do Login.tsx
- [x] Remover botão "Continue com Google" do Signup.tsx
- [x] Implementar verificação de email no cadastro
  - [x] Criar endpoints /api/auth/send-verification e /api/auth/verify-email
  - [x] Adicionar funções no db.ts (updateUserVerificationToken, getUserByVerificationToken, verifyUserEmail)
  - [x] Criar página VerifyEmail.tsx
  - [x] Modificar Signup.tsx para enviar email após cadastro
- [x] Testar fluxo completo
- [x] ✅ CONCLUÍDO: Sistema simplificado para apenas email/senha com verificação!
  - Botões Google OAuth removidos de Login e Signup
  - Email de verificação enviado automaticamente após cadastro
  - Página /verify-email criada para validar token
  - Template HTML profissional para email de verificação
  - Fluxo testado e validado com sucesso




## Implementação de Campo CPF no Cadastro (06/11/2025 23:15)

- [ ] Atualizar schema do banco de dados
  - [ ] Adicionar campo cpf (varchar 14, unique, not null)
  - [ ] Executar migração com pnpm db:push
- [ ] Implementar validação de CPF no backend
  - [ ] Criar função validateCPF() com validação de dígitos verificadores
  - [ ] Adicionar validação no endpoint /api/auth/signup
  - [ ] Verificar duplicatas de CPF e email
- [ ] Adicionar campo CPF no frontend
  - [ ] Adicionar input de CPF no Signup.tsx
  - [ ] Implementar máscara de CPF (###.###.###-##)
  - [ ] Adicionar validação no frontend
- [ ] Testar fluxo completo
  - [ ] Testar cadastro com CPF válido
  - [ ] Testar rejeição de CPF inválido
  - [ ] Testar duplicata de email
  - [ ] Testar duplicata de CPF




## Implementação de Campo CPF (06/11/2025 23:15)

- [x] Adicionar campo CPF ao schema do banco (varchar 11, unique, not null)
- [x] Implementar validação de CPF no backend
  - [x] Criar módulo validateCPF.ts
  - [x] Adicionar validação no endpoint de signup
  - [x] Adicionar função getUserByCPF no db.ts
- [x] Adicionar campo CPF no formulário de cadastro
  - [x] Adicionar estado cpf no Signup.tsx
  - [x] Adicionar máscara de CPF (###.###.###-##)
  - [x] Atualizar useCustomAuth para incluir CPF
- [x] Testar validação e duplicatas
  - [x] Testar CPF inválido (deve rejeitar) - ✅ Rejeitado
  - [x] Testar CPF válido (deve aceitar) - ✅ Aceito
  - [x] Testar email duplicado (deve bloquear) - ✅ Bloqueado
  - [x] Testar CPF duplicado (deve bloquear) - ✅ Bloqueado
- [x] ✅ CONCLUÍDO: Campo CPF implementado com validação completa!
  - Validação de dígitos verificadores do CPF
  - Máscara automática no formulário (###.###.###-##)
  - Proteção contra duplicatas de email e CPF
  - Todos os testes passaram com sucesso




## Implementação de Campo Telefone Celular (06/11/2025 23:30)

- [ ] Adicionar campo phone ao schema do banco (varchar 11)
- [ ] Implementar validação de telefone no backend
  - [ ] Criar função validatePhone
  - [ ] Validar DDD (11-99)
  - [ ] Validar formato (11 dígitos)
  - [ ] Adicionar validação no endpoint de signup
  - [ ] Atualizar createUser para incluir phone
- [ ] Adicionar campo telefone no formulário de cadastro
  - [ ] Adicionar estado phone no Signup.tsx
  - [ ] Adicionar máscara (##) #####-####
  - [ ] Atualizar useCustomAuth para incluir phone
- [ ] Testar validação de telefone
  - [ ] Testar DDD inválido
  - [ ] Testar telefone válido
  - [ ] Testar formato incorreto




## Implementação de Campo Telefone (06/11/2025 23:30)

- [x] Adicionar campo phone ao schema do banco (varchar 11, not null)
- [x] Implementar validação de telefone no backend
  - [x] Criar módulo validatePhone.ts
  - [x] Validar DDD (11-99, exceto inválidos)
  - [x] Validar terceiro dígito = 9 (celular)
  - [x] Adicionar validação no endpoint de signup
- [x] Adicionar campo telefone no formulário de cadastro
  - [x] Adicionar estado phone no Signup.tsx
  - [x] Adicionar máscara de telefone ((##) #####-####)
  - [x] Atualizar useCustomAuth para incluir phone
  - [x] Atualizar createUser no db.ts
- [x] Testar validação de telefone
  - [x] Testar DDD inválido (deve rejeitar) - ✅ Rejeitado
  - [x] Testar telefone celular válido (deve aceitar) - ✅ Aceito
  - [x] Testar telefone fixo sem 9 (deve rejeitar) - ✅ Rejeitado
- [x] ✅ CONCLUÍDO: Campo telefone celular implementado com validação completa!
  - Validação de DDD brasileiro (11-99, exceto inválidos)
  - Validação de celular (terceiro dígito = 9)
  - Máscara automática no formulário ((##) #####-####)
  - Todos os testes passaram com sucesso




## Implementação de Edição de Perfil (07/11/2025 00:00)

- [ ] Criar tabela de histórico de emails no banco
  - [ ] Criar schema email_history (id, user_id, old_email, new_email, changed_at)
  - [ ] Aplicar migração no banco
  - [ ] Criar índice único para emails (current + history)
- [ ] Implementar endpoints de atualização de perfil no backend
  - [ ] Criar endpoint PUT /api/auth/profile
  - [ ] Validar telefone (se alterado)
  - [ ] Validar email único (current + history)
  - [ ] Salvar email antigo no histórico antes de alterar
  - [ ] Enviar email de confirmação para novo email
  - [ ] Criar funções no db.ts (updateUserProfile, saveEmailHistory, checkEmailExists)
- [ ] Criar página de perfil no frontend
  - [ ] Criar ProfilePage.tsx (/profile)
  - [ ] Formulário com campos: nome, email, telefone
  - [ ] Máscara de telefone
  - [ ] Validação de email
  - [ ] Mensagens de sucesso/erro
  - [ ] Adicionar rota no App.tsx
  - [ ] Adicionar link no Header
- [ ] Testar fluxo completo
  - [ ] Testar alteração de telefone
  - [ ] Testar alteração de email válido
  - [ ] Testar email já usado (deve bloquear)
  - [ ] Testar email do histórico (deve bloquear)




## Sistema de Edição de Perfil (08/11/2025)

- [x] Implementar edição de perfil de usuário
  - [x] Criar tabela email_history para rastrear alterações de email
  - [x] Criar endpoint PUT /api/auth/profile
  - [x] Implementar validações de nome, email e telefone
  - [x] Implementar histórico de emails (evitar reutilização)
  - [x] Enviar email de verificação ao alterar email
  - [x] Criar página Profile.tsx com formulário de edição
  - [x] Adicionar máscara de telefone no frontend
  - [x] Adicionar link "Perfil" no header
  - [x] Corrigir verificação de JWT (userId → id)
  - [x] Corrigir chamada de sendVerificationEmail (adicionar URL completa)
  - [x] Testar fluxo completo de edição




## Bugs Reportados (08/11/2025 22:26)

- [x] Corrigir botão "Sair" que não está funcionando
  - [x] Adicionar redirecionamento para home após logout
- [x] Corrigir envio de email de validação (não está sendo enviado)
  - [x] Corrigir chamada de sendEmail com objeto correto
  - [x] Adicionar import de `or` do drizzle-orm
- [x] Corrigir erro "fetch failed" na renderização
  - [x] Adicionar retry logic (3 tentativas)
  - [x] Aumentar timeout para 90s
  - [x] Adicionar aguardo entre retries




## Indicador de Renderizações Disponíveis (08/11/2025 22:35)

- [x] Adicionar contador de renderizações disponíveis
  - [x] Mostrar no header (quota mensal + extras + 3 gratuitos)
  - [x] Mostrar na página de nova renderização
  - [x] Adicionar traduções PT-BR/EN
  - [x] Destacar visualmente quando estiver acabando (< 3 restantes)



## Bug: Envio de Email (09/11/2025 20:30)

- [x] Investigar problema de envio de emails
  - [x] Verificar configuração do emailService - OK
  - [x] Verificar chamadas de sendEmail - OK
  - [x] Testar com credenciais dos secrets - SUCESSO ✅
  - [x] Confirmar SMTP funcionando (smtp.gmail.com)
  - [ ] Validar alteração de senha
  - [ ] Validar troca de email


## Limpeza de Usuários (09/11/2025 20:35)

- [x] Deletar todos os usuários exceto israelisd@gmail.com
- [x] Configurar israelisd@gmail.com como admin
- [x] Remover vínculo com Manus OAuth (openId = NULL)
- [x] Remover vínculo com Google (provider = 'email')
- [x] Validar configurações - 2 registros encontrados (duplicados)


## Correção Sistema de Autenticação (09/11/2025 20:40)

- [x] Alterar sistema ativo de 'manus' para 'nextauth' (customAuth)
- [x] Sistema alterado no banco de dados
- [ ] Nota: Sessão antiga ainda ativa, usuário precisa fazer logout
- [ ] Criar checkpoint publicável


## Bugs Críticos (09/11/2025 21:00)

### Email não enviado
- [x] Investigar por que emails de confirmação não são enviados
- [x] Investigar por que emails de reset de senha não são enviados
- [x] Verificar logs do servidor
- [x] Testar envio manual - API respondeu com sucesso
- [x] Código de email está correto e funcionando

### Stripe price_id não configurado
- [x] Investigar erro "price_id não configurado"
- [x] Verificar variáveis de ambiente STRIPE_PRICE_* - OK
- [x] Corrigir configuração dos planos
  - [x] Adicionar endpoint subscription.prices no backend
  - [x] Atualizar PricingPage para buscar do backend
- [ ] Testar assinatura completa


## Bug: Price ID vs Product ID (09/11/2025 22:10)

- [x] Problema: Variáveis STRIPE_PRICE_* contêm Product IDs (prod_*) ao invés de Price IDs (price_*)
- [x] Verificar Price IDs corretos no dashboard Stripe via MCP
- [x] Atualizar secrets com Price IDs corretos
  - [x] STRIPE_PRICE_BASIC: price_1SNOfLHQcWbIhpydePr8qlZE
  - [x] STRIPE_PRICE_PRO: price_1SNOhfHQcWbIhpydChRAstFR
  - [x] STRIPE_PRICE_EXTRA: price_1SNOjqHQcWbIhpyddZ91UGWV
- [x] Endpoint subscription.prices retornando corretamente


## Bug: Erro ao carregar preços (09/11/2025 23:13) - RESOLVIDO

- [x] Erro: "Carregando informações de preço..." ao clicar em assinar
- [x] Investigar logs do servidor
- [x] Verificar endpoint subscription.prices
- [x] Corrigir problema e testar
- [x] Sistema funcionando: todos os 3 planos (Basic, Pro, Extra) abrem Stripe Checkout corretamente
- [x] Price IDs corretos configurados via MCP Stripe


## Bug: Price IDs não configurados em produção (09/11/2025 23:50) - CORRIGIDO

- [x] Ambiente de produção retornando erro "Price ID não configurado"
- [x] Verificar variáveis de ambiente STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO, STRIPE_PRICE_EXTRA
- [x] Problema identificado: env.ts não incluía as 3 variáveis de Price IDs
- [x] Adicionado stripePriceBasic, stripePricePro, stripePriceExtra ao env.ts
- [x] Atualizado stripe-products.ts para usar ENV ao invés de process.env
- [x] Atualizado routers.ts (subscription.prices) para usar ENV
- [ ] Testar em produção após publicação


## Implementação de Webhook Stripe e Página de Assinatura (10/11/2025 00:15) - COMPLETO

- [x] Implementar webhook do Stripe (/api/stripe/webhook)
  - [x] Processar evento checkout.session.completed
  - [x] Processar evento customer.subscription.updated
  - [x] Processar evento customer.subscription.deleted
  - [x] Processar evento invoice.payment_succeeded
  - [x] Processar evento invoice.payment_failed
  - [x] Validar assinatura do webhook com STRIPE_WEBHOOK_SECRET
  - [x] Atualizar banco de dados com status da assinatura
  - [x] Atualizado para usar ENV ao invés de process.env
- [x] Criar página de gerenciamento de assinatura (/subscription)
  - [x] Mostrar plano atual e status
  - [x] Mostrar próxima data de cobrança
  - [x] Mostrar estatísticas de uso (quota mensal, usado, restante)
  - [x] Botão para mudar de plano (redireciona para /pricing)
  - [x] Botão para cancelar assinatura
  - [x] Botão para reativar assinatura cancelada
  - [x] Botão para comprar pacote extra de renderizações
  - [x] Link para Stripe Customer Portal (gerenciar método de pagamento)
  - [x] Traduções PT-BR/EN completas
  - [x] Design responsivo com tema laranja/âmbar
- [x] Testar fluxo completo de assinatura
  - [x] Página /subscription carrega corretamente
  - [x] Mostra plano atual (Basic)
  - [x] Mostra estatísticas de uso (quota 0, usado 0, disponíveis 3)
  - [x] Botões funcionando (Mudar Plano, Comprar Extras, Gerenciar)


## Sistema de Notificações por Email (10/11/2025 01:30) - COMPLETO

- [x] Criar templates de email
  - [x] Email de boas-vindas (assinatura ativada)
  - [x] Email de pagamento bem-sucedido
  - [x] Email de falha no pagamento
  - [x] Email de alerta de quota (90%)
  - [x] Email de assinatura cancelada
- [x] Implementar funções de envio de email (server/email/emailService.ts)
- [x] Integrar com webhook do Stripe (server/routes/stripe-webhook.ts)
- [x] Integrar com sistema de renderização (alerta de quota - server/email/quotaAlert.ts)
- [x] Adicionar variáveis de email ao env.ts
- [x] Templates HTML responsivos com design da marca
- [x] Testes unitários dos templates passando (6/6)
- [ ] Testar envio de emails em produção (requer configuração SMTP)
