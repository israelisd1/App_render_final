# 💳 Sistema de Assinaturas Stripe

Documentação completa do sistema de assinaturas e pagamentos integrado com Stripe.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Planos Disponíveis](#planos-disponíveis)
- [Arquitetura](#arquitetura)
- [Fluxo de Pagamento](#fluxo-de-pagamento)
- [Webhook do Stripe](#webhook-do-stripe)
- [Endpoints tRPC](#endpoints-trpc)
- [Página de Gerenciamento](#página-de-gerenciamento)
- [Configuração](#configuração)
- [Testes](#testes)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O sistema de assinaturas permite que usuários assinem planos mensais ou comprem pacotes extras de renderizações. Toda a gestão de pagamentos é feita através do Stripe, com processamento automático via webhooks.

### Características

- ✅ **3 planos**: Free, Basic (R$ 99,90/mês), Pro (R$ 149,90/mês)
- ✅ **Pacotes extras**: 20 renderizações por R$ 49,90
- ✅ **Webhook automático**: Processa eventos de pagamento em tempo real
- ✅ **Customer Portal**: Usuários podem gerenciar assinatura e pagamentos
- ✅ **Cancelamento flexível**: Cancela no final do período de cobrança
- ✅ **Reativação**: Assinaturas canceladas podem ser reativadas

## 💰 Planos Disponíveis

### Free
- **Preço**: Gratuito
- **Quota mensal**: 0 renderizações
- **Renderizações iniciais**: 3 gratuitas no cadastro
- **Qualidade**: HD (com compressão)
- **Download alta resolução**: Não

### Basic (R$ 99,90/mês)
- **Price ID**: `price_1SNOfLHQcWbIhpydePr8qlZE`
- **Quota mensal**: 100 renderizações
- **Qualidade**: HD (com compressão)
- **Download alta resolução**: Não
- **Renovação**: Automática mensal

### Pro (R$ 149,90/mês)
- **Price ID**: `price_1SNOhfHQcWbIhpydChRAstFR`
- **Quota mensal**: 170 renderizações
- **Qualidade**: MAX (sem compressão)
- **Download alta resolução**: Sim
- **Renovação**: Automática mensal

### Pacote Extra (R$ 49,90)
- **Price ID**: `price_1SNOjqHQcWbIhpyddZ91UGWV`
- **Quantidade**: 20 renderizações adicionais
- **Tipo**: Pagamento único
- **Validade**: Não expira
- **Pode acumular**: Sim

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Clica "Assinar"
       ▼
┌─────────────────────┐
│  Frontend (React)   │
│  trpc.subscription  │
│     .create()       │
└──────┬──────────────┘
       │
       │ 2. Cria checkout
       ▼
┌─────────────────────┐
│  Backend (tRPC)     │
│  subscription       │
│    .create          │
└──────┬──────────────┘
       │
       │ 3. Stripe API
       ▼
┌─────────────────────┐
│   Stripe Checkout   │
│   (Pagamento)       │
└──────┬──────────────┘
       │
       │ 4. Webhook
       ▼
┌─────────────────────┐
│  /api/stripe/       │
│     webhook         │
│  (Processa evento)  │
└──────┬──────────────┘
       │
       │ 5. Atualiza DB
       ▼
┌─────────────────────┐
│   Banco de Dados    │
│   (MySQL/TiDB)      │
└─────────────────────┘
```

## 🔄 Fluxo de Pagamento

### 1. Assinatura de Plano

```typescript
// 1. Usuário clica em "Assinar Basic"
const createCheckout = trpc.subscription.create.useMutation();

createCheckout.mutate({ 
  priceId: 'price_1SNOfLHQcWbIhpydePr8qlZE' 
});

// 2. Backend cria sessão de checkout
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: 'https://site.com/subscription?success=true',
  cancel_url: 'https://site.com/pricing?canceled=true',
});

// 3. Usuário é redirecionado para Stripe Checkout
window.location.href = session.url;

// 4. Após pagamento, Stripe envia webhook
// checkout.session.completed → customer.subscription.created

// 5. Webhook atualiza banco de dados
await updateUserSubscription({
  userId,
  subscriptionId: subscription.id,
  subscriptionStatus: 'active',
  plan: 'basic',
  monthlyQuota: 100,
});
```

### 2. Compra de Pacote Extra

```typescript
// 1. Usuário clica em "Comprar Extras"
const buyExtra = trpc.subscription.buyExtra.useMutation();

buyExtra.mutate({ quantity: 20 });

// 2. Backend cria sessão de checkout (pagamento único)
const session = await stripe.checkout.sessions.create({
  mode: 'payment', // Pagamento único
  line_items: [{
    price: 'price_1SNOjqHQcWbIhpyddZ91UGWV',
    quantity: 1,
  }],
  metadata: {
    userId: user.id,
    type: 'extra_renders',
    quantity: '20',
  },
});

// 3. Webhook processa pagamento
if (session.metadata.type === 'extra_renders') {
  await addExtraRenders(userId, 20);
}
```

## 🔔 Webhook do Stripe

### Endpoint

```
POST /api/stripe/webhook
```

### Eventos Processados

#### 1. `checkout.session.completed`
Acionado quando o usuário completa o pagamento.

```typescript
// Se for assinatura
if (session.mode === 'subscription') {
  // Será processado em customer.subscription.created
}

// Se for pacote extra
if (session.metadata.type === 'extra_renders') {
  const quantity = parseInt(session.metadata.quantity);
  await addExtraRenders(userId, quantity);
}
```

#### 2. `customer.subscription.created` / `customer.subscription.updated`
Acionado quando assinatura é criada ou atualizada.

```typescript
const priceId = subscription.items.data[0].price.id;
const plan = getPlanFromPriceId(priceId); // 'basic' ou 'pro'
const planConfig = getPlanConfig(plan);

await updateUserSubscription({
  userId,
  subscriptionId: subscription.id,
  subscriptionStatus: 'active',
  plan,
  monthlyQuota: planConfig.features.monthlyQuota,
});
```

#### 3. `customer.subscription.deleted`
Acionado quando assinatura é cancelada/expirada.

```typescript
await updateUserSubscription({
  userId,
  subscriptionId: undefined,
  subscriptionStatus: 'inactive',
  plan: 'free',
  monthlyQuota: 0,
});
```

#### 4. `invoice.payment_succeeded`
Acionado quando pagamento mensal é bem-sucedido.

```typescript
// Reseta quota mensal
await resetMonthlyQuota(userId);
```

#### 5. `invoice.payment_failed`
Acionado quando pagamento mensal falha.

```typescript
await updateUserSubscription({
  userId,
  subscriptionStatus: 'past_due',
});

// TODO: Enviar email notificando falha
```

### Validação de Assinatura

```typescript
const sig = req.headers['stripe-signature'];
const webhookSecret = ENV.stripeWebhookSecret;

const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  webhookSecret
);
```

## 📡 Endpoints tRPC

### `subscription.prices`
Retorna Price IDs dos planos.

```typescript
const { data } = trpc.subscription.prices.useQuery();
// { basic: 'price_...', pro: 'price_...', extra: 'price_...' }
```

### `subscription.status`
Retorna status completo da assinatura do usuário.

```typescript
const { data } = trpc.subscription.status.useQuery();
// {
//   plan: 'basic',
//   subscriptionStatus: 'active',
//   monthlyQuota: 100,
//   monthlyRendersUsed: 25,
//   extraRenders: 10,
//   billingPeriodEnd: '2025-12-10',
// }
```

### `subscription.create`
Cria checkout para nova assinatura.

```typescript
const mutation = trpc.subscription.create.useMutation();
mutation.mutate({ priceId: 'price_...' });
// Retorna: { url: 'https://checkout.stripe.com/...' }
```

### `subscription.cancel`
Cancela assinatura no final do período.

```typescript
const mutation = trpc.subscription.cancel.useMutation();
mutation.mutate();
// Assinatura permanece ativa até o final do período pago
```

### `subscription.reactivate`
Reativa assinatura cancelada.

```typescript
const mutation = trpc.subscription.reactivate.useMutation();
mutation.mutate();
// Remove flag de cancelamento
```

### `subscription.portal`
Abre Stripe Customer Portal.

```typescript
const mutation = trpc.subscription.portal.useMutation();
mutation.mutate();
// Retorna: { url: 'https://billing.stripe.com/...' }
```

### `subscription.buyExtra`
Compra pacote extra de renderizações.

```typescript
const mutation = trpc.subscription.buyExtra.useMutation();
mutation.mutate({ quantity: 20 });
// Retorna: { url: 'https://checkout.stripe.com/...' }
```

## 📄 Página de Gerenciamento

### Rota
```
/subscription
```

### Componentes

#### Card do Plano Atual
- Ícone do plano (⚡ Basic, ✨ Pro)
- Nome do plano
- Status (ativo, cancelado, inativo)
- Botão "Mudar Plano"

#### Estatísticas de Uso
- **Quota Mensal**: Total de renderizações incluídas no plano
- **Utilizadas**: Quantidade usada no período atual
- **Disponíveis**: Restantes + extras acumulados
- Barra de progresso visual

#### Informações de Cobrança
- Próxima data de cobrança
- Aviso se assinatura está cancelada

#### Ações Disponíveis
1. **Comprar Renderizações Extras**
   - 20 renderizações por R$ 49,90
   - Botão "Comprar Extras"

2. **Gerenciar Forma de Pagamento**
   - Abre Stripe Customer Portal
   - Botão "Gerenciar"

3. **Cancelar Assinatura**
   - Cancela no final do período
   - Botão "Cancelar Assinatura"

4. **Reativar Assinatura**
   - Aparece se assinatura estiver cancelada
   - Botão "Reativar"

## ⚙️ Configuração

### 1. Variáveis de Ambiente

```env
# Chaves do Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_BASIC=price_1SNOfLHQcWbIhpydePr8qlZE
STRIPE_PRICE_PRO=price_1SNOhfHQcWbIhpydChRAstFR
STRIPE_PRICE_EXTRA=price_1SNOjqHQcWbIhpyddZ91UGWV
```

### 2. Configurar Webhook no Stripe

1. Acesse [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. **URL**: `https://seu-dominio.com/api/stripe/webhook`
4. **Eventos**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Signing secret** e adicione em `STRIPE_WEBHOOK_SECRET`

### 3. Criar Products e Prices no Stripe

#### Via Dashboard:
1. Acesse [Products](https://dashboard.stripe.com/products)
2. Crie 3 produtos:
   - **Arqrender Basic**: R$ 99,90/mês
   - **Arqrender Pro**: R$ 149,90/mês
   - **Pacote Extra**: R$ 49,90 (pagamento único)
3. Copie os Price IDs e adicione nas variáveis de ambiente

#### Via API:
```bash
# Basic
stripe prices create \
  --unit-amount=9990 \
  --currency=brl \
  --recurring[interval]=month \
  --product-data[name]="Arqrender Basic"

# Pro
stripe prices create \
  --unit-amount=14990 \
  --currency=brl \
  --recurring[interval]=month \
  --product-data[name]="Arqrender Pro"

# Extra
stripe prices create \
  --unit-amount=4990 \
  --currency=brl \
  --product-data[name]="Pacote Extra - 20 Renderizações"
```

## 🧪 Testes

### Testar Webhook Localmente

```bash
# 1. Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Encaminhar webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. Testar evento
stripe trigger checkout.session.completed
```

### Testar Fluxo Completo

1. **Criar conta de teste**
2. **Ir para /pricing**
3. **Clicar em "Assinar Basic"**
4. **Usar cartão de teste**: `4242 4242 4242 4242`
5. **Verificar webhook recebido** nos logs
6. **Conferir /subscription** se plano foi ativado

### Cartões de Teste Stripe

```
# Sucesso
4242 4242 4242 4242

# Falha (insufficient funds)
4000 0000 0000 9995

# Requer autenticação 3D Secure
4000 0027 6000 3184
```

## 🐛 Troubleshooting

### Price IDs não carregam em produção

**Problema**: Página /pricing mostra "Carregando informações de preço..."

**Causa**: Variáveis `STRIPE_PRICE_*` não estão configuradas no servidor.

**Solução**:
1. Vá em Management UI → Settings → Secrets
2. Adicione as 3 variáveis:
   - `STRIPE_PRICE_BASIC`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_EXTRA`
3. Aguarde servidor reiniciar (30-60s)
4. Teste novamente

### Webhook não está sendo recebido

**Problema**: Pagamentos não atualizam o banco de dados.

**Diagnóstico**:
```bash
# Verificar logs do servidor
pm2 logs

# Testar webhook manualmente
curl -X POST https://seu-dominio.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}'
```

**Soluções**:
1. Verificar se URL do webhook está correta no Stripe Dashboard
2. Verificar se `STRIPE_WEBHOOK_SECRET` está configurado
3. Verificar se servidor está acessível publicamente
4. Verificar logs de erro do webhook

### Assinatura não cancela

**Problema**: Botão "Cancelar" não funciona.

**Diagnóstico**:
```typescript
// Verificar se subscriptionId existe
const { data } = trpc.subscription.status.useQuery();
console.log(data.subscriptionId); // Deve ter valor
```

**Soluções**:
1. Verificar se usuário tem `subscriptionId` no banco
2. Verificar se `STRIPE_SECRET_KEY` está correta
3. Verificar logs de erro no console

### Customer Portal não abre

**Problema**: Botão "Gerenciar" não funciona.

**Causa**: Usuário não tem `stripeCustomerId`.

**Solução**:
```typescript
// Criar customer manualmente
const customer = await stripe.customers.create({
  email: user.email,
  name: user.name,
  metadata: { userId: user.id },
});

await updateUserSubscription({
  userId: user.id,
  stripeCustomerId: customer.id,
});
```

## 📚 Referências

- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Stripe Testing](https://stripe.com/docs/testing)

---

**Última atualização**: Novembro 2025  
**Versão**: 1.0.0
