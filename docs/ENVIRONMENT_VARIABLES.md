# 🔐 Variáveis de Ambiente

Documentação completa de todas as variáveis de ambiente necessárias para o projeto.

## 📋 Índice

- [Banco de Dados](#banco-de-dados)
- [Autenticação](#autenticação)
- [Stripe](#stripe)
- [Email](#email)
- [Storage S3](#storage-s3)
- [API de Renderização](#api-de-renderização)
- [Frontend](#frontend)
- [Analytics](#analytics)
- [Como Configurar](#como-configurar)

## 🗄️ Banco de Dados

### `DATABASE_URL`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `mysql://user:password@host:3306/arqrender`

String de conexão com o banco de dados MySQL/TiDB.

## 🔐 Autenticação

### `JWT_SECRET`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `seu-secret-jwt-super-seguro-aqui-min-32-chars`

Secret para assinar tokens JWT. Use uma string aleatória de no mínimo 32 caracteres.

**Gerar**:
```bash
openssl rand -base64 32
```

### `OWNER_OPEN_ID`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `openid-do-proprietario`

OpenID do proprietário do sistema (será admin automaticamente).

### `OWNER_NAME`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `Israel Dias`

Nome do proprietário do sistema.

### OAuth Manus

#### `VITE_APP_ID`
**Obrigatório**: Sim  
**Tipo**: String

ID da aplicação no sistema Manus OAuth.

#### `OAUTH_SERVER_URL`
**Obrigatório**: Sim  
**Tipo**: String  
**Padrão**: `https://api.manus.im`

URL do servidor OAuth do Manus.

#### `VITE_OAUTH_PORTAL_URL`
**Obrigatório**: Sim  
**Tipo**: String  
**Padrão**: `https://portal.manus.im`

URL do portal OAuth do Manus (frontend).

#### `NEXTAUTH_URL`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `https://seu-dominio.com`

URL base da aplicação para callbacks OAuth.

### Google OAuth (Opcional)

#### `GOOGLE_CLIENT_ID`
**Obrigatório**: Não  
**Tipo**: String  
**Exemplo**: `123456789.apps.googleusercontent.com`

Client ID do Google OAuth (se usar login com Google).

#### `GOOGLE_CLIENT_SECRET`
**Obrigatório**: Não  
**Tipo**: String

Client Secret do Google OAuth.

## 💳 Stripe

### Chaves da API

#### `STRIPE_SECRET_KEY`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `sk_live_...` ou `sk_test_...`

Chave secreta da API Stripe. Use `sk_test_` para desenvolvimento e `sk_live_` para produção.

**Obter**: [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)

#### `STRIPE_PUBLISHABLE_KEY`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `pk_live_...` ou `pk_test_...`

Chave pública da API Stripe.

#### `STRIPE_WEBHOOK_SECRET`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `whsec_...`

Secret para validar webhooks do Stripe.

**Obter**: [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)

### Price IDs

#### `STRIPE_PRICE_BASIC`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `price_1SNOfLHQcWbIhpydePr8qlZE`

Price ID do plano Basic (R$ 99,90/mês).

#### `STRIPE_PRICE_PRO`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `price_1SNOhfHQcWbIhpydChRAstFR`

Price ID do plano Pro (R$ 149,90/mês).

#### `STRIPE_PRICE_EXTRA`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `price_1SNOjqHQcWbIhpyddZ91UGWV`

Price ID do pacote extra (R$ 49,90).

**Criar Price IDs**: Ver [docs/SUBSCRIPTIONS.md](./SUBSCRIPTIONS.md#3-criar-products-e-prices-no-stripe)

## 📧 Email

### `EMAIL_HOST`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `smtp.gmail.com`

Servidor SMTP para envio de emails.

### `EMAIL_PORT`
**Obrigatório**: Sim  
**Tipo**: Number  
**Exemplo**: `587`

Porta do servidor SMTP (587 para TLS, 465 para SSL).

### `EMAIL_USER`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `seu-email@gmail.com`

Usuário para autenticação SMTP.

### `EMAIL_PASSWORD`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `abcd efgh ijkl mnop`

Senha do email. Para Gmail, use [App Password](https://myaccount.google.com/apppasswords).

### `EMAIL_FROM`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `Arqrender <seu-email@gmail.com>`

Endereço de remetente dos emails.

## ☁️ Storage S3

### `S3_ENDPOINT`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `https://nyc3.digitaloceanspaces.com`

Endpoint do serviço S3 (DigitalOcean Spaces, AWS S3, etc).

### `S3_BUCKET`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `arqrender-images`

Nome do bucket S3.

### `S3_ACCESS_KEY`
**Obrigatório**: Sim  
**Tipo**: String

Access Key do S3.

### `S3_SECRET_KEY`
**Obrigatório**: Sim  
**Tipo**: String

Secret Key do S3.

### `S3_REGION`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `nyc3` ou `us-east-1`

Região do bucket S3.

### `S3_CDN_ENDPOINT`
**Obrigatório**: Não  
**Tipo**: String  
**Exemplo**: `https://arqrender-images.nyc3.cdn.digitaloceanspaces.com`

Endpoint do CDN (se disponível).

## 🎨 API de Renderização

### Manus Forge API

#### `BUILT_IN_FORGE_API_URL`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `https://forge-api.manus.im`

URL da API interna do Manus Forge.

#### `BUILT_IN_FORGE_API_KEY`
**Obrigatório**: Sim  
**Tipo**: String

Chave de API do Manus Forge.

#### `VITE_FRONTEND_FORGE_API_URL`
**Obrigatório**: Não  
**Tipo**: String

URL pública da API (se diferente da URL do servidor).

#### `VITE_FRONTEND_FORGE_API_KEY`
**Obrigatório**: Não  
**Tipo**: String

Chave pública da API (se necessário no frontend).

### RapidAPI (Alternativa)

#### `RAPIDAPI_KEY`
**Obrigatório**: Não  
**Tipo**: String

Chave da RapidAPI (se usar API alternativa).

## 🌐 Frontend

### `VITE_APP_TITLE`
**Obrigatório**: Sim  
**Tipo**: String  
**Padrão**: `Arqrender`

Título da aplicação exibido no navegador.

**Configurar**: Management UI → Settings → General

### `VITE_APP_LOGO`
**Obrigatório**: Sim  
**Tipo**: String  
**Padrão**: `/logo.svg`

Caminho para o logo da aplicação.

**Configurar**: Management UI → Settings → General

### `VITE_FRONTEND_URL`
**Obrigatório**: Sim  
**Tipo**: String  
**Exemplo**: `https://seu-dominio.com`

URL pública da aplicação (para emails, redirects, etc).

## 📊 Analytics (Opcional)

### `VITE_ANALYTICS_ENDPOINT`
**Obrigatório**: Não  
**Tipo**: String

Endpoint do serviço de analytics.

### `VITE_ANALYTICS_WEBSITE_ID`
**Obrigatório**: Não  
**Tipo**: String

ID do website no serviço de analytics.

## ⚙️ Como Configurar

### Desenvolvimento Local

1. **Crie arquivo `.env`** na raiz do projeto
2. **Copie as variáveis** necessárias
3. **Preencha os valores** reais
4. **Nunca commite** o arquivo `.env`

```bash
# Exemplo mínimo para desenvolvimento
DATABASE_URL=mysql://root:password@localhost:3306/arqrender
JWT_SECRET=$(openssl rand -base64 32)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
# ... outras variáveis
```

### Produção (Manus Platform)

1. **Acesse Management UI** → Settings → Secrets
2. **Adicione cada variável**:
   - Clique em "+ Add Secret"
   - Digite o nome (ex: `STRIPE_SECRET_KEY`)
   - Cole o valor
   - Clique em "Save"
3. **Aguarde reinicialização** do servidor (30-60s)

### Produção (VPS/Servidor)

1. **Crie arquivo `.env`** no servidor
2. **Configure permissões**:
   ```bash
   chmod 600 .env
   chown app-user:app-user .env
   ```
3. **Reinicie aplicação**:
   ```bash
   pm2 restart all
   ```

## 🔒 Segurança

### ⚠️ Nunca Exponha

- ❌ Não commite `.env` no Git
- ❌ Não compartilhe secrets em mensagens/emails
- ❌ Não use secrets de produção em desenvolvimento
- ❌ Não logue secrets no console

### ✅ Boas Práticas

- ✅ Use secrets diferentes para dev/staging/prod
- ✅ Rotacione secrets periodicamente
- ✅ Use variáveis `VITE_*` apenas para valores públicos
- ✅ Valide secrets no startup da aplicação
- ✅ Use `.env.example` (sem valores) para documentar

## 🧪 Validação

### Verificar se Variáveis Estão Configuradas

```typescript
// server/_core/env.ts
export const ENV = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  // ...
};

// Validar no startup
if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY não configurado");
}
```

### Testar Conexões

```bash
# Testar banco de dados
pnpm db:push

# Testar Stripe
stripe customers list --api-key $STRIPE_SECRET_KEY

# Testar S3
aws s3 ls s3://$S3_BUCKET --endpoint-url $S3_ENDPOINT
```

## 📚 Referências

- [Stripe API Keys](https://stripe.com/docs/keys)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [DigitalOcean Spaces](https://docs.digitalocean.com/products/spaces/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Última atualização**: Novembro 2025  
**Versão**: 1.0.0
