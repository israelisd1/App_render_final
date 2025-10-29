# Configuração de Produtos no Stripe - Arqrender

Este guia detalha como configurar os produtos e preços no Stripe Dashboard para o sistema de assinaturas do Arqrender.

## 📋 Produtos a Criar

### 1. **Plano Basic** - R$ 99,90/mês
- 100 renderizações por mês
- Qualidade HD (compressão aplicada)
- Download em qualidade padrão

### 2. **Plano Pro** - R$ 149,90/mês  
- 170 renderizações por mês
- Qualidade máxima (sem compressão)
- Download em alta resolução

### 3. **Pacote Extra** - R$ 49,90
- 20 renderizações adicionais
- Respeita qualidade do plano atual
- Compra única (não recorrente)

---

## 🔧 Passo a Passo - Stripe Dashboard

### **Parte 1: Acessar Stripe Dashboard**

1. Acesse: https://dashboard.stripe.com
2. Faça login com sua conta
3. **Importante**: Certifique-se de estar em **modo de teste** (toggle no canto superior direito)
4. No menu lateral, clique em **"Products"** (Produtos)

---

### **Parte 2: Criar Plano Basic**

1. Clique em **"+ Add product"** (Adicionar produto)

2. **Product information** (Informações do produto):
   - **Name**: `Arqrender Basic`
   - **Description**: `Plano Basic - 100 renderizações por mês em qualidade HD`
   - **Image**: (Opcional) Adicione logo do Arqrender
   - **Statement descriptor**: `ARQRENDER BASIC` (aparece na fatura do cartão)

3. **Pricing** (Preços):
   - **Pricing model**: `Standard pricing`
   - **Price**: `99.90`
   - **Currency**: `BRL` (Real Brasileiro)
   - **Billing period**: `Monthly` (Mensal)
   - **Usage is metered**: ❌ Deixe desmarcado

4. **Additional options** (Opções adicionais):
   - **Tax behavior**: `Exclusive` (imposto exclusivo)
   - **Tax code**: Selecione apropriado para seu caso

5. Clique em **"Save product"**

6. **Anote o Price ID**:
   - Após salvar, você verá algo como: `price_1234567890abcdef`
   - **COPIE** este ID - você vai precisar dele!

---

### **Parte 3: Criar Plano Pro**

1. Clique em **"+ Add product"** novamente

2. **Product information**:
   - **Name**: `Arqrender Pro`
   - **Description**: `Plano Pro - 170 renderizações por mês em alta resolução`
   - **Statement descriptor**: `ARQRENDER PRO`

3. **Pricing**:
   - **Price**: `149.90`
   - **Currency**: `BRL`
   - **Billing period**: `Monthly`

4. Clique em **"Save product"**

5. **Anote o Price ID** do Plano Pro

---

### **Parte 4: Criar Pacote Extra**

1. Clique em **"+ Add product"**

2. **Product information**:
   - **Name**: `Arqrender - Pacote Extra`
   - **Description**: `20 renderizações adicionais`
   - **Statement descriptor**: `ARQRENDER EXTRA`

3. **Pricing**:
   - **Pricing model**: `Standard pricing`
   - **Price**: `49.90`
   - **Currency**: `BRL`
   - **Billing period**: `One time` (Pagamento único)
   - **Usage is metered**: ❌ Deixe desmarcado

4. Clique em **"Save product"**

5. **Anote o Price ID** do Pacote Extra

---

## 🔑 Configurar Variáveis de Ambiente

Após criar os produtos, adicione os Price IDs ao arquivo `.env`:

```env
# Stripe Product Price IDs
STRIPE_PRICE_BASIC=price_1234567890abcdef
STRIPE_PRICE_PRO=price_0987654321fedcba
STRIPE_PRICE_EXTRA=price_abcdef1234567890
```

**⚠️ Importante**: 
- Estes são IDs de **teste** (começam com `price_`)
- Quando for para produção, você precisará criar os produtos novamente no **modo live** e atualizar os IDs

---

## 📊 Configurações Adicionais Recomendadas

### **1. Configurar Cancelamento de Assinatura**

1. No Stripe Dashboard, vá em **Settings** → **Billing**
2. Em **"Subscription settings"**:
   - **Proration behavior**: `Always invoice immediately`
   - **When a subscription is canceled**: `At the end of the billing period`
   - Isso permite que usuários usem até o final do mês pago

### **2. Configurar Webhooks**

1. Vá em **Developers** → **Webhooks**
2. Clique em **"+ Add endpoint"**
3. **Endpoint URL**: `https://seu-dominio.com/api/stripe/webhook`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`

5. Clique em **"Add endpoint"**
6. **Copie o Webhook Secret** (começa com `whsec_`)
7. Adicione ao `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
   ```

### **3. Configurar Customer Portal** (Para usuários gerenciarem assinaturas)

1. Vá em **Settings** → **Customer portal**
2. Clique em **"Activate test link"**
3. Configure:
   - **Allow customers to**: 
     - ✅ Update payment method
     - ✅ Cancel subscriptions
     - ✅ View invoice history
   - **Cancellation behavior**:
     - ✅ Cancel at end of billing period
     - ✅ Cancel immediately (opcional)

4. Salve as configurações

---

## 🧪 Testar Produtos

### **Cartões de Teste do Stripe**:

```
Sucesso: 4242 4242 4242 4242
Falha:   4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

CVV: Qualquer 3 dígitos
Data: Qualquer data futura
```

### **Fluxo de Teste**:

1. Crie uma sessão de checkout no código
2. Use cartão de teste
3. Complete o pagamento
4. Verifique se webhook foi recebido
5. Confirme que assinatura foi criada no Stripe Dashboard

---

## 📝 Checklist de Configuração

- [ ] Plano Basic criado (R$ 99,90/mês)
- [ ] Plano Pro criado (R$ 149,90/mês)
- [ ] Pacote Extra criado (R$ 49,90 único)
- [ ] Price IDs copiados e salvos
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook endpoint configurado
- [ ] Webhook secret salvo
- [ ] Customer Portal ativado
- [ ] Testado com cartão de teste

---

## 🚀 Próximos Passos

Após configurar os produtos no Stripe:

1. ✅ Adicionar Price IDs ao `.env`
2. ⏭️ Implementar backend (FASE 4)
3. ⏭️ Criar páginas de assinatura (FASE 6)
4. ⏭️ Testar fluxo completo

---

## 📚 Referências

- [Stripe Products Documentation](https://stripe.com/docs/products-prices/overview)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)

