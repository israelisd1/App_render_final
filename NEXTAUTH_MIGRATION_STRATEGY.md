# Estratégia de Migração: OAuth Manus → NextAuth

## 📋 Análise da Situação Atual

### ✅ O que já está implementado (90% completo):

1. **Dependências instaladas:**
   - next-auth 4.24.11
   - bcryptjs (hash de senhas)
   - nodemailer (envio de emails)

2. **Backend NextAuth:**
   - ✅ `server/auth/nextauth.config.ts` - Configuração completa
   - ✅ `server/auth/routes.ts` - Rotas de signup, verificação, reset de senha
   - ✅ `server/auth/next-auth.d.ts` - Tipos TypeScript
   - ✅ Funções de banco de dados para NextAuth

3. **Schema do banco:**
   - ✅ Campo `provider` (email, google, manus)
   - ✅ Campo `password` (hash bcrypt)
   - ✅ Campo `emailVerified` (0/1)
   - ✅ Campos de tokens (verification, reset)
   - ✅ Compatível com OAuth e Email/Senha

4. **Frontend (páginas criadas):**
   - ✅ `LoginPage.tsx`
   - ✅ `SignupPage.tsx`
   - ✅ `ForgotPasswordPage.tsx`

### ❌ O que está faltando:

1. **Import do GoogleProvider quebrado** (linha 2 do nextauth.config.ts)
2. **Rotas NextAuth desabilitadas** no servidor principal
3. **Rotas frontend não registradas** no App.tsx
4. **Hook useAuth** ainda usa sistema OAuth Manus
5. **Migração de usuários existentes** (openId → email)

---

## 🎯 Estratégia de Implementação

### **FASE 1: Correção de Imports e Configuração** (30 min)

**Objetivo:** Corrigir imports do next-auth e habilitar rotas

**Ações:**
1. Verificar exports corretos do `next-auth@4.24.11`
2. Corrigir import do GoogleProvider:
   ```typescript
   // Testar estas variações:
   import GoogleProvider from "next-auth/providers/google"
   // ou
   const GoogleProvider = require("next-auth/providers/google").default
   ```
3. Descomentar GoogleProvider no `nextauth.config.ts`
4. Descomentar `registerAuthRoutes()` em `server/_core/index.ts`
5. Testar servidor iniciando sem erros

**Validação:**
- [ ] Servidor inicia sem erros de import
- [ ] Rota `/api/auth/signin` responde
- [ ] Rota `/api/auth/signup` responde

---

### **FASE 2: Adaptação do Schema e Migração de Dados** (45 min)

**Objetivo:** Garantir compatibilidade total entre sistemas

**Ações:**
1. Criar função de migração de usuários OAuth Manus:
   ```typescript
   // Converter openId em email para usuários Manus existentes
   async function migrateManusUsers() {
     // UPDATE users SET provider='manus' WHERE openId IS NOT NULL
     // Manter openId por compatibilidade
   }
   ```

2. Atualizar funções de banco (`server/db.ts`):
   - ✅ `getUserByEmail()` - já existe
   - ✅ `createUser()` - já existe
   - ✅ `getUserByVerificationToken()` - já existe
   - ✅ `verifyUserEmail()` - já existe
   - ✅ `setResetPasswordToken()` - já existe
   - ✅ `getUserByResetToken()` - já existe
   - ✅ `updateUserPassword()` - já existe
   - ✅ `updateUserLastSignIn()` - já existe

3. Adicionar suporte a múltiplos providers:
   - Usuários com `openId` → provider='manus'
   - Usuários com `password` → provider='email'
   - Usuários com Google → provider='google'

**Validação:**
- [ ] Usuários existentes mantêm acesso
- [ ] Novos usuários podem se cadastrar
- [ ] Múltiplos providers coexistem

---

### **FASE 3: Integração das Rotas de Autenticação** (30 min)

**Objetivo:** Conectar backend NextAuth ao servidor Express

**Ações:**
1. Habilitar rotas NextAuth em `server/_core/index.ts`:
   ```typescript
   import { registerAuthRoutes } from "../auth/routes";
   
   // Após configurar Express
   registerAuthRoutes(app);
   ```

2. Configurar variáveis de ambiente:
   ```bash
   NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>
   NEXTAUTH_URL=https://3000-i4z1pxg1fp61lt0bcrxiv-61485dd6.manusvm.computer
   GOOGLE_CLIENT_ID=<do Google Cloud Console>
   GOOGLE_CLIENT_SECRET=<do Google Cloud Console>
   ```

3. Testar endpoints:
   - POST `/api/auth/signup` (criar conta)
   - POST `/api/auth/signin` (login)
   - GET `/api/auth/session` (verificar sessão)

**Validação:**
- [ ] Endpoint de signup funciona
- [ ] Endpoint de signin funciona
- [ ] Sessão JWT é criada corretamente

---

### **FASE 4: Atualização do Frontend** (1 hora)

**Objetivo:** Substituir OAuth Manus por NextAuth no frontend

**Ações:**

1. **Adicionar rotas no `App.tsx`:**
   ```typescript
   import LoginPage from "./pages/LoginPage";
   import SignupPage from "./pages/SignupPage";
   import ForgotPasswordPage from "./pages/ForgotPasswordPage";
   
   // Adicionar rotas:
   <Route path="/login" component={LoginPage} />
   <Route path="/signup" component={SignupPage} />
   <Route path="/forgot-password" component={ForgotPasswordPage} />
   ```

2. **Criar novo hook `useNextAuth`:**
   ```typescript
   // client/src/hooks/useNextAuth.ts
   import { useEffect, useState } from "react";
   
   export function useNextAuth() {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       fetch('/api/auth/session')
         .then(res => res.json())
         .then(data => {
           setUser(data.user || null);
           setLoading(false);
         });
     }, []);
     
     return { user, loading, isAuthenticated: !!user };
   }
   ```

3. **Atualizar componentes que usam autenticação:**
   - `Header.tsx` - trocar `useAuth()` por `useNextAuth()`
   - `RenderPage.tsx` - trocar autenticação
   - `HistoryPage.tsx` - trocar autenticação
   - `SubscriptionPage.tsx` - trocar autenticação

4. **Atualizar botões de login:**
   ```typescript
   // Antes: window.location.href = getLoginUrl()
   // Depois: window.location.href = '/login'
   ```

**Validação:**
- [ ] Páginas de login/signup carregam
- [ ] Cadastro funciona
- [ ] Login com email/senha funciona
- [ ] Login com Google funciona
- [ ] Sessão persiste após refresh
- [ ] Logout funciona

---

### **FASE 5: Compatibilidade Reversa** (30 min)

**Objetivo:** Manter usuários OAuth Manus funcionando

**Estratégias:**

1. **Dual Auth (Recomendado):**
   - Manter rotas OAuth Manus (`/api/oauth/*`)
   - Adicionar rotas NextAuth (`/api/auth/*`)
   - Usuários antigos continuam usando Manus
   - Novos usuários usam NextAuth
   - Migração gradual opcional

2. **Migração Forçada:**
   - Desabilitar OAuth Manus
   - Forçar usuários a resetar senha
   - Converter todos para NextAuth

**Recomendação:** **Dual Auth** por segurança

**Ações (Dual Auth):**
1. Manter `server/_core/oauth.ts` ativo
2. Manter callback `/api/oauth/callback`
3. Adicionar lógica no `useAuth`:
   ```typescript
   // Verificar sessão NextAuth primeiro
   const nextAuthSession = await fetch('/api/auth/session');
   if (nextAuthSession.user) return nextAuthSession.user;
   
   // Fallback para OAuth Manus
   const manusSession = await trpc.auth.me.useQuery();
   return manusSession;
   ```

**Validação:**
- [ ] Usuários OAuth Manus continuam logados
- [ ] Novos usuários usam NextAuth
- [ ] Ambos os sistemas coexistem

---

### **FASE 6: Testes End-to-End** (1 hora)

**Cenários de teste:**

1. **Cadastro com Email/Senha:**
   - [ ] Criar conta nova
   - [ ] Receber email de verificação (mock)
   - [ ] Verificar email
   - [ ] Fazer login
   - [ ] Verificar 3 renders gratuitos

2. **Login com Google:**
   - [ ] Clicar em "Continuar com Google"
   - [ ] Autenticar no Google
   - [ ] Redirecionar para app
   - [ ] Verificar 3 renders gratuitos

3. **Reset de Senha:**
   - [ ] Solicitar reset
   - [ ] Receber email (mock)
   - [ ] Clicar no link
   - [ ] Definir nova senha
   - [ ] Fazer login com nova senha

4. **Fluxo de Assinatura:**
   - [ ] Login com NextAuth
   - [ ] Acessar /pricing
   - [ ] Comprar plano Basic
   - [ ] Verificar quota atualizada
   - [ ] Fazer renderização
   - [ ] Verificar qualidade HD

5. **Compatibilidade OAuth Manus:**
   - [ ] Usuário existente faz login via Manus
   - [ ] Acessa todas as funcionalidades
   - [ ] Assinatura funciona normalmente

**Validação:**
- [ ] Todos os cenários passam
- [ ] Sem erros no console
- [ ] Sem quebras de funcionalidade

---

## 🚨 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Usuários existentes perdem acesso | 🔴 Alto | Dual Auth + migração gradual |
| Imports do next-auth quebrados | 🟡 Médio | Testar versões alternativas |
| Sessões JWT incompatíveis | 🟡 Médio | Manter cookies separados |
| Google OAuth não configurado | 🟢 Baixo | Deixar apenas Email/Senha primeiro |
| Emails não enviados | 🟢 Baixo | Mock temporário + logs |

---

## 📦 Checklist de Implementação

### Pré-requisitos:
- [ ] Backup do banco de dados
- [ ] Checkpoint do código atual
- [ ] Variáveis de ambiente preparadas

### Implementação:
- [ ] FASE 1: Correção de imports ✅
- [ ] FASE 2: Schema e migração ✅
- [ ] FASE 3: Rotas backend ✅
- [ ] FASE 4: Frontend ✅
- [ ] FASE 5: Compatibilidade ✅
- [ ] FASE 6: Testes E2E ✅

### Pós-implementação:
- [ ] Documentar fluxo de autenticação
- [ ] Atualizar README.md
- [ ] Criar guia de troubleshooting
- [ ] Monitorar logs por 24h

---

## 🎯 Decisão Recomendada

**Abordagem:** **Dual Auth com Migração Gradual**

**Justificativa:**
1. ✅ Zero downtime para usuários existentes
2. ✅ Testes incrementais sem risco
3. ✅ Rollback fácil se necessário
4. ✅ Migração opcional no futuro

**Próximos Passos:**
1. Confirmar com usuário a abordagem
2. Configurar Google OAuth (obter credentials)
3. Gerar NEXTAUTH_SECRET
4. Iniciar FASE 1

---

## ⏱️ Estimativa de Tempo Total

- FASE 1: 30 min
- FASE 2: 45 min
- FASE 3: 30 min
- FASE 4: 1 hora
- FASE 5: 30 min
- FASE 6: 1 hora

**Total: ~4-5 horas** (implementação completa e testada)

---

## 📞 Perguntas para o Usuário

1. **Preferência de abordagem:**
   - [ ] Dual Auth (recomendado - mantém Manus + NextAuth)
   - [ ] Migração forçada (desabilita Manus, força reset)

2. **Google OAuth:**
   - [ ] Já tem Google Client ID/Secret?
   - [ ] Quer configurar agora ou depois?
   - [ ] Pode começar só com Email/Senha?

3. **Envio de emails:**
   - [ ] Configurar SMTP real (Gmail, SendGrid)?
   - [ ] Usar mock temporário (logs)?
   - [ ] Implementar depois?

4. **Urgência:**
   - [ ] Implementar tudo agora (4-5h)?
   - [ ] Implementar em etapas (testar cada fase)?
   - [ ] Apenas preparar e documentar?

---

**Status:** ✅ Estratégia completa e pronta para execução
**Risco:** 🟢 Baixo (com Dual Auth)
**Complexidade:** 🟡 Média
**Tempo:** 4-5 horas

