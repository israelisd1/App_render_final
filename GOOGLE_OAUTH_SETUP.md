# Guia de Configuração: Google OAuth para NextAuth

## 📋 Passo a Passo para Obter Google Client ID e Secret

### **1. Acessar Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google
3. Se não tiver um projeto, clique em **"Criar Projeto"**
   - Nome: `Arqrender` (ou o nome que preferir)
   - Clique em **"Criar"**

---

### **2. Ativar Google+ API**

1. No menu lateral, vá em: **APIs e Serviços** → **Biblioteca**
2. Pesquise por: **"Google+ API"**
3. Clique em **"Google+ API"**
4. Clique no botão **"Ativar"**

---

### **3. Configurar Tela de Consentimento OAuth**

1. No menu lateral, vá em: **APIs e Serviços** → **Tela de consentimento OAuth**
2. Escolha **"Externo"** (para permitir qualquer usuário Google)
3. Clique em **"Criar"**

**Preencha os campos obrigatórios:**

- **Nome do app:** `Arqrender`
- **E-mail de suporte do usuário:** `seu-email@gmail.com`
- **Logotipo do app:** (opcional)
- **Domínio do app:** (deixe em branco por enquanto)
- **Domínios autorizados:** (deixe em branco por enquanto)
- **E-mail de contato do desenvolvedor:** `seu-email@gmail.com`

4. Clique em **"Salvar e continuar"**
5. Em **"Escopos"**, clique em **"Adicionar ou remover escopos"**
   - Selecione: `email`, `profile`, `openid`
   - Clique em **"Atualizar"**
6. Clique em **"Salvar e continuar"**
7. Em **"Usuários de teste"**, adicione seu email (opcional para desenvolvimento)
8. Clique em **"Salvar e continuar"**
9. Clique em **"Voltar ao painel"**

---

### **4. Criar Credenciais OAuth 2.0**

1. No menu lateral, vá em: **APIs e Serviços** → **Credenciais**
2. Clique no botão **"+ Criar credenciais"**
3. Selecione **"ID do cliente OAuth"**

**Configuração:**

- **Tipo de aplicativo:** `Aplicativo da Web`
- **Nome:** `Arqrender Web Client`

**Origens JavaScript autorizadas:**
```
http://localhost:3000
https://3000-i4z1pxg1fp61lt0bcrxiv-61485dd6.manusvm.computer
```
(Adicione seu domínio de produção quando tiver)

**URIs de redirecionamento autorizados:**
```
http://localhost:3000/api/auth/callback/google
https://3000-i4z1pxg1fp61lt0bcrxiv-61485dd6.manusvm.computer/api/auth/callback/google
```
(Adicione seu domínio de produção quando tiver)

4. Clique em **"Criar"**

---

### **5. Copiar Credenciais**

Após criar, você verá uma tela com:

- **ID do cliente:** `123456789-abc123def456.apps.googleusercontent.com`
- **Chave secreta do cliente:** `GOCSPX-AbCdEf123456`

**⚠️ IMPORTANTE:** Copie esses valores agora! Você precisará deles no próximo passo.

---

### **6. Configurar Variáveis de Ambiente**

Adicione as seguintes variáveis no painel de configuração do Manus:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=5SNb9b+Q5egjTk1emg9bLOx2lCSTRyy9g0KbRAoTmno=
NEXTAUTH_URL=https://3000-i4z1pxg1fp61lt0bcrxiv-61485dd6.manusvm.computer

# Google OAuth
GOOGLE_CLIENT_ID=<cole aqui o ID do cliente>
GOOGLE_CLIENT_SECRET=<cole aqui a chave secreta>
```

**Exemplo real:**
```bash
NEXTAUTH_SECRET=5SNb9b+Q5egjTk1emg9bLOx2lCSTRyy9g0KbRAoTmno=
NEXTAUTH_URL=https://3000-i4z1pxg1fp61lt0bcrxiv-61485dd6.manusvm.computer
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEf123456
```

---

### **7. Reiniciar Servidor**

Após adicionar as variáveis de ambiente, reinicie o servidor para aplicar as mudanças.

---

## 🧪 Testar Google OAuth

1. Acesse: `http://localhost:3000/login`
2. Clique no botão **"Continuar com Google"**
3. Selecione sua conta Google
4. Autorize o acesso
5. Você deve ser redirecionado de volta ao app logado

---

## 🔧 Troubleshooting

### **Erro: "redirect_uri_mismatch"**

**Causa:** A URI de redirecionamento não está configurada no Google Cloud Console.

**Solução:**
1. Vá em **APIs e Serviços** → **Credenciais**
2. Clique no seu OAuth Client ID
3. Adicione a URI exata que aparece no erro em **"URIs de redirecionamento autorizados"**
4. Salve e tente novamente

### **Erro: "Access blocked: This app's request is invalid"**

**Causa:** A tela de consentimento OAuth não está configurada corretamente.

**Solução:**
1. Vá em **APIs e Serviços** → **Tela de consentimento OAuth**
2. Verifique se todos os campos obrigatórios estão preenchidos
3. Certifique-se de que o status é **"Em produção"** ou **"Teste"**

### **Erro: "NEXTAUTH_SECRET is not set"**

**Causa:** A variável de ambiente `NEXTAUTH_SECRET` não foi configurada.

**Solução:**
1. Gere um novo secret: `openssl rand -base64 32`
2. Adicione como variável de ambiente: `NEXTAUTH_SECRET=<valor gerado>`
3. Reinicie o servidor

---

## 📝 Notas Importantes

1. **Modo de Teste vs Produção:**
   - No modo de teste, apenas usuários adicionados em "Usuários de teste" podem fazer login
   - Para permitir qualquer usuário Google, publique o app (botão "Publicar app" na tela de consentimento)

2. **Domínio de Produção:**
   - Quando fizer deploy em produção, adicione o domínio real nas origens e URIs de redirecionamento
   - Exemplo: `https://arqrender.com` e `https://arqrender.com/api/auth/callback/google`

3. **Segurança:**
   - **NUNCA** commite o `GOOGLE_CLIENT_SECRET` no Git
   - Mantenha as credenciais apenas em variáveis de ambiente
   - Rotacione o secret periodicamente

---

## ✅ Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] Google+ API ativada
- [ ] Tela de consentimento OAuth configurada
- [ ] ID do cliente OAuth criado
- [ ] Origens JavaScript autorizadas adicionadas
- [ ] URIs de redirecionamento autorizados adicionados
- [ ] GOOGLE_CLIENT_ID copiado
- [ ] GOOGLE_CLIENT_SECRET copiado
- [ ] NEXTAUTH_SECRET gerado
- [ ] NEXTAUTH_URL configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Servidor reiniciado
- [ ] Login com Google testado e funcionando

---

**Pronto!** Agora você pode usar Google OAuth no NextAuth! 🎉

