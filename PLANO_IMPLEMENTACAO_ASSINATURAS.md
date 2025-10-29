# Plano Detalhado de Implementação - Sistema de Assinaturas

## 📋 Visão Geral

Migração do modelo de tokens para modelo de assinatura mensal com dois planos (Basic e Pro), incluindo pacotes extras e remoção de menções a "Renderização Avançada".

---

## 🎯 Objetivos

1. ✅ Remover todas as menções a "Renderização Avançada" e substituir por "renderização avançada"
2. ✅ Implementar sistema de assinaturas mensais (Basic e Pro)
3. ✅ Implementar compra de pacotes extras (múltiplos de 20 imagens)
4. ✅ Implementar controle de qualidade de imagem por plano
5. ✅ Implementar reset mensal automático de quota
6. ✅ Ocultar download em alta resolução para plano Basic

---

## 📅 Fases de Implementação

### **FASE 1: Remoção de Menções a "Renderização Avançada"** (Estimativa: 1-2 horas)

#### 1.1. Frontend - Traduções
**Arquivos**: `client/src/contexts/LanguageContext.tsx`

**Substituições PT-BR**:
- "Renderização Avançada" → "Renderização Avançada"
- "Inteligência Artificial" → "Algoritmos Avançados"
- "com Renderização Avançada" → "com Tecnologia Avançada"
- "Renderização Arquitetônica com Renderização Avançada" → "Renderização Arquitetônica Avançada"

**Substituições EN**:
- "Advanced Rendering" → "Advanced Rendering"
- "Artificial Intelligence" → "Advanced Algorithms"
- "Advanced Rendering-Powered" → "Advanced Technology"
- "Advanced Rendering-Powered Architectural Rendering" → "Advanced Architectural Rendering"

#### 1.2. Frontend - Componentes
**Arquivos a revisar**:
- `client/src/pages/HomePage.tsx`
- `client/src/pages/RenderPage.tsx`
- `client/src/pages/HistoryPage.tsx`
- `client/index.html` (meta tags)

#### 1.3. Documentação
**Arquivos**:
- `README.md`
- `GUIA_INSTALACAO_COMPLETO.md`
- `INSTALLATION_COMPLETE.md`
- `DIGITALOCEAN_SETUP.md`
- Todos os outros `.md`

**Buscar e substituir**:
```bash
find . -name "*.md" -type f -exec sed -i 's/\bIA\b/Renderização Avançada/g' {} +
find . -name "*.md" -type f -exec sed -i 's/\bAI\b/Advanced Rendering/g' {} +
```

---

### **FASE 2: Atualização do Schema do Banco** (Estimativa: 30min)

#### 2.1. Adicionar Campos de Assinatura

**Arquivo**: `drizzle/schema.ts`

```typescript
// Adicionar à tabela users
subscriptionId: text("subscription_id"), // ID da assinatura no Stripe
subscriptionStatus: text("subscription_status"), // active, canceled, past_due
plan: text("plan"), // 'basic' ou 'pro'
monthlyQuota: integer("monthly_quota").default(0), // 100 ou 170
monthlyRendersUsed: integer("monthly_renders_used").default(0),
extraRenders: integer("extra_renders").default(0), // Pacotes extras
billingPeriodStart: timestamp("billing_period_start"),
billingPeriodEnd: timestamp("billing_period_end"),
```

#### 2.2. Migração SQL

**Arquivo**: `drizzle/migrations/add_subscription_fields.sql`

```sql
-- Adicionar campos de assinatura
ALTER TABLE users ADD COLUMN subscription_id TEXT;
ALTER TABLE users ADD COLUMN subscription_status TEXT;
ALTER TABLE users ADD COLUMN plan TEXT;
ALTER TABLE users ADD COLUMN monthly_quota INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN monthly_renders_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN extra_renders INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN billing_period_start TIMESTAMP;
ALTER TABLE users ADD COLUMN billing_period_end TIMESTAMP;

-- Migrar usuários existentes para plano Basic gratuito (0 quota)
UPDATE users 
SET plan = 'free', 
    monthly_quota = 0,
    subscription_status = 'inactive'
WHERE plan IS NULL;
```

#### 2.3. Remover Sistema de Tokens

**Decisão**: Manter tabela `tokens` por compatibilidade, mas marcar como deprecated.

**Alternativa**: Remover completamente após migração.

---

### **FASE 3: Configuração do Stripe** (Estimativa: 1 hora)

#### 3.1. Criar Produtos no Stripe Dashboard

**Produto 1: Arqrender Basic**
- Nome: "Arqrender Basic"
- Descrição: "100 renderizações mensais em qualidade HD"
- Preço: R$ 99,90 / mês
- Metadata:
  ```json
  {
    "plan": "basic",
    "quota": "100",
    "resolution": "hd"
  }
  ```

**Produto 2: Arqrender Pro**
- Nome: "Arqrender Pro"
- Descrição: "170 renderizações mensais em alta resolução"
- Preço: R$ 149,90 / mês
- Metadata:
  ```json
  {
    "plan": "pro",
    "quota": "170",
    "resolution": "max"
  }
  ```

**Produto 3: Pacote Extra - 20 Imagens**
- Nome: "Pacote Extra - 20 Renderizações"
- Descrição: "20 renderizações adicionais (resolução do plano atual)"
- Preço: R$ 49,90 (one-time payment)
- Metadata:
  ```json
  {
    "type": "extra_pack",
    "extra_renders": "20"
  }
  ```

#### 3.2. Obter Price IDs

Após criar os produtos, anotar os Price IDs:
- `BASIC_PRICE_ID`: price_xxxxxxxxxxxxx
- `PRO_PRICE_ID`: price_xxxxxxxxxxxxx
- `EXTRA_PACK_PRICE_ID`: price_xxxxxxxxxxxxx

Adicionar ao `.env`:
```env
STRIPE_BASIC_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_EXTRA_PACK_PRICE_ID=price_xxxxxxxxxxxxx
```

---

### **FASE 4: Backend - Lógica de Assinatura** (Estimativa: 3-4 horas)

#### 4.1. Funções de Banco de Dados

**Arquivo**: `server/db.ts`

```typescript
// Verificar se usuário pode renderizar
export async function canUserRender(userId: number): Promise<boolean> {
  const user = await getUserById(userId);
  
  if (!user) return false;
  if (user.subscriptionStatus !== 'active') return false;
  
  const totalAvailable = (user.monthlyQuota || 0) + (user.extraRenders || 0);
  const totalUsed = user.monthlyRendersUsed || 0;
  
  return totalUsed < totalAvailable;
}

// Decrementar quota de renderização
export async function decrementRenderQuota(userId: number): Promise<void> {
  const user = await getUserById(userId);
  
  if (!user) throw new Error("User not found");
  
  if (user.monthlyRendersUsed < user.monthlyQuota) {
    // Usa quota mensal
    await pool.query(
      `UPDATE users SET monthly_renders_used = monthly_renders_used + 1 WHERE id = $1`,
      [userId]
    );
  } else if (user.extraRenders > 0) {
    // Usa pacote extra
    await pool.query(
      `UPDATE users SET extra_renders = extra_renders - 1 WHERE id = $1`,
      [userId]
    );
  } else {
    throw new Error("No renders available");
  }
}

// Reset quota mensal
export async function resetMonthlyQuota(userId: number): Promise<void> {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  await pool.query(
    `UPDATE users 
     SET monthly_renders_used = 0,
         billing_period_start = $1,
         billing_period_end = $2
     WHERE id = $3`,
    [now, nextMonth, userId]
  );
}

// Atualizar assinatura do usuário
export async function updateUserSubscription(userId: number, data: {
  subscriptionId: string;
  subscriptionStatus: string;
  plan: string;
  monthlyQuota: number;
}): Promise<void> {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  await pool.query(
    `UPDATE users 
     SET subscription_id = $1,
         subscription_status = $2,
         plan = $3,
         monthly_quota = $4,
         monthly_renders_used = 0,
         billing_period_start = $5,
         billing_period_end = $6
     WHERE id = $7`,
    [
      data.subscriptionId,
      data.subscriptionStatus,
      data.plan,
      data.monthlyQuota,
      now,
      nextMonth,
      userId
    ]
  );
}

// Adicionar renderizações extras
export async function addExtraRenders(userId: number, amount: number): Promise<void> {
  await pool.query(
    `UPDATE users SET extra_renders = extra_renders + $1 WHERE id = $2`,
    [amount, userId]
  );
}
```

#### 4.2. Rotas de Assinatura

**Arquivo**: `server/routers.ts`

```typescript
// Criar assinatura
app.post("/api/subscriptions/create", async (req, res) => {
  const { priceId } = req.body;
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await getUserById(userId);
  
  // Criar ou recuperar customer no Stripe
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: userId.toString() }
    });
    customerId = customer.id;
    await updateUserStripeCustomer(userId, customerId);
  }
  
  // Criar assinatura
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  
  res.json({
    subscriptionId: subscription.id,
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
  });
});

// Comprar pacote extra
app.post("/api/subscriptions/buy-extra", async (req, res) => {
  const { quantity } = req.body; // Múltiplos de 20
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await getUserById(userId);
  
  if (user.subscriptionStatus !== 'active') {
    return res.status(400).json({ error: "Active subscription required" });
  }
  
  // Criar sessão de checkout para pagamento único
  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    mode: 'payment',
    line_items: [{
      price: process.env.STRIPE_EXTRA_PACK_PRICE_ID,
      quantity: quantity, // 1 = 20 imagens, 2 = 40 imagens, etc
    }],
    success_url: `${process.env.VITE_APP_URL}/dashboard?extra_purchase=success`,
    cancel_url: `${process.env.VITE_APP_URL}/dashboard?extra_purchase=cancel`,
    metadata: {
      userId: userId.toString(),
      type: 'extra_pack',
      extra_renders: (quantity * 20).toString(),
    },
  });
  
  res.json({ url: session.url });
});

// Cancelar assinatura
app.post("/api/subscriptions/cancel", async (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = await getUserById(userId);
  
  if (!user.subscriptionId) {
    return res.status(400).json({ error: "No active subscription" });
  }
  
  // Cancelar no final do período
  await stripe.subscriptions.update(user.subscriptionId, {
    cancel_at_period_end: true,
  });
  
  res.json({ success: true });
});
```

#### 4.3. Webhook Handler

**Arquivo**: `server/routers.ts`

```typescript
// Webhook do Stripe
app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Processar eventos
  switch (event.type) {
    case 'invoice.paid':
      // Assinatura paga - ativar/renovar
      const invoice = event.data.object;
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customerId = subscription.customer;
      
      // Buscar usuário pelo Stripe Customer ID
      const user = await getUserByStripeCustomerId(customerId);
      
      if (user) {
        const priceId = subscription.items.data[0].price.id;
        const metadata = subscription.items.data[0].price.metadata;
        
        // Atualizar assinatura do usuário
        await updateUserSubscription(user.id, {
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          plan: metadata.plan,
          monthlyQuota: parseInt(metadata.quota),
        });
        
        console.log(`[Subscription] User ${user.id} subscription activated/renewed`);
      }
      break;
    
    case 'invoice.payment_failed':
      // Pagamento falhou
      const failedInvoice = event.data.object;
      const failedSubscription = await stripe.subscriptions.retrieve(failedInvoice.subscription);
      const failedUser = await getUserByStripeCustomerId(failedSubscription.customer);
      
      if (failedUser) {
        await pool.query(
          `UPDATE users SET subscription_status = 'past_due' WHERE id = $1`,
          [failedUser.id]
        );
        
        // TODO: Enviar email notificando falha no pagamento
        console.log(`[Subscription] Payment failed for user ${failedUser.id}`);
      }
      break;
    
    case 'customer.subscription.deleted':
      // Assinatura cancelada
      const deletedSubscription = event.data.object;
      const deletedUser = await getUserByStripeCustomerId(deletedSubscription.customer);
      
      if (deletedUser) {
        await pool.query(
          `UPDATE users 
           SET subscription_status = 'canceled',
               monthly_quota = 0
           WHERE id = $1`,
          [deletedUser.id]
        );
        
        console.log(`[Subscription] User ${deletedUser.id} subscription canceled`);
      }
      break;
    
    case 'checkout.session.completed':
      // Pagamento de pacote extra concluído
      const session = event.data.object;
      
      if (session.metadata.type === 'extra_pack') {
        const userId = parseInt(session.metadata.userId);
        const extraRenders = parseInt(session.metadata.extra_renders);
        
        await addExtraRenders(userId, extraRenders);
        
        console.log(`[Extra Pack] User ${userId} purchased ${extraRenders} extra renders`);
      }
      break;
  }
  
  res.json({ received: true });
});
```

---

### **FASE 5: Controle de Qualidade de Imagem** (Estimativa: 2-3 horas)

#### 5.1. Instalar Sharp

```bash
pnpm add sharp
```

#### 5.2. Atualizar architectureApi.ts

**Arquivo**: `server/architectureApi.ts`

```typescript
interface RenderRequest {
  sceneType: "interior" | "exterior";
  outputFormat: "webp" | "jpg" | "png" | "avif";
  image: string;
  prompt?: string;
  renderingTime?: "standard" | "detailed"; // NOVO
  base64Response?: boolean;
}

export async function callArchitectureRenderingAPI(
  request: RenderRequest
): Promise<RenderResponse> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY not configured");
  }

  // Sempre usar "detailed" para melhor qualidade
  const requestWithDefaults = {
    ...request,
    renderingTime: "detailed",
  };

  try {
    const response = await fetch(
      "https://architecture-rendering-api.p.rapidapi.com/render",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host": "architecture-rendering-api.p.rapidapi.com",
          "x-rapidapi-key": apiKey,
        },
        body: JSON.stringify(requestWithDefaults),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ArchitectureAPI] Error response:", errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ArchitectureAPI] Request failed:", error);
    throw error;
  }
}
```

#### 5.3. Criar Serviço de Compressão

**Arquivo**: `server/imageCompression.ts`

```typescript
import sharp from 'sharp';
import { storagePut } from './_core/storage';

interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-1
  format: 'jpg' | 'png' | 'webp';
}

export async function compressAndUploadImage(
  imageUrl: string,
  options: CompressionOptions
): Promise<string> {
  try {
    // Download imagem original
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Comprimir imagem
    let sharpInstance = sharp(buffer)
      .resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    
    // Aplicar formato e qualidade
    switch (options.format) {
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality: Math.round(options.quality * 100) });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: Math.round(options.quality * 100) });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: Math.round(options.quality * 100) });
        break;
    }
    
    const compressedBuffer = await sharpInstance.toBuffer();
    
    // Upload para S3
    const filename = `compressed-${Date.now()}.${options.format}`;
    const uploadResult = await storagePut(
      `renders/${filename}`,
      compressedBuffer,
      `image/${options.format}`
    );
    
    return uploadResult.url;
  } catch (error) {
    console.error('[ImageCompression] Failed to compress image:', error);
    throw error;
  }
}

// Presets por plano
export const COMPRESSION_PRESETS = {
  basic: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'jpg' as const,
  },
  pro: null, // Sem compressão
};
```

#### 5.4. Atualizar Rota de Renderização

**Arquivo**: `server/routers.ts`

```typescript
app.post("/api/render", async (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Verificar se usuário pode renderizar
  const canRender = await canUserRender(userId);
  if (!canRender) {
    return res.status(403).json({ 
      error: "Quota exceeded",
      message: "Você atingiu o limite de renderizações do seu plano"
    });
  }
  
  const user = await getUserById(userId);
  const input = req.body;
  
  // Criar registro de renderização
  const renderId = await createRender({
    userId,
    sceneType: input.sceneType,
    outputFormat: input.outputFormat,
    originalImageUrl: input.imageUrl,
    prompt: input.prompt,
    status: "processing",
  });
  
  // Decrementar quota
  await decrementRenderQuota(userId);
  
  // Processar renderização em background
  (async () => {
    try {
      // Chamar API com rendering_time="detailed"
      const apiResponse = await callArchitectureRenderingAPI({
        sceneType: input.sceneType,
        outputFormat: input.outputFormat,
        image: input.imageUrl,
        prompt: input.prompt,
        renderingTime: "detailed", // Sempre detailed
      });
      
      if (apiResponse.output) {
        let finalImageUrl = apiResponse.output;
        
        // Comprimir se plano Basic
        if (user.plan === 'basic') {
          finalImageUrl = await compressAndUploadImage(
            apiResponse.output,
            COMPRESSION_PRESETS.basic
          );
        }
        
        // Atualizar registro
        await updateRenderStatus(renderId, "completed", {
          renderedImageUrl: finalImageUrl,
          completedAt: new Date(),
        });
      } else {
        await updateRenderStatus(renderId, "failed", {
          error: apiResponse.error || "Unknown error",
        });
      }
    } catch (error) {
      console.error(`[Render ${renderId}] Error:`, error);
      await updateRenderStatus(renderId, "failed", {
        error: error.message,
      });
    }
  })();
  
  res.json({ renderId });
});
```

---

### **FASE 6: Frontend - Páginas de Assinatura** (Estimativa: 4-5 horas)

#### 6.1. Criar Página de Planos

**Arquivo**: `client/src/pages/PricingPage.tsx`

```typescript
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      
      const { subscriptionId, clientSecret } = await response.json();
      
      // Redirecionar para checkout do Stripe
      // Implementar com Stripe Elements ou Checkout
      navigate(`/checkout?client_secret=${clientSecret}`);
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-center text-gray-600 mb-12">
          {t('pricing.subtitle')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano Basic */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-2">{t('pricing.basic.name')}</h2>
            <div className="text-4xl font-bold text-orange-600 mb-4">
              R$ 99,90<span className="text-lg text-gray-600">/mês</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                100 renderizações/mês
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Qualidade HD (1920x1080)
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Suporte por email
              </li>
              <li className="flex items-center text-gray-400">
                <span className="mr-2">✗</span>
                Download em alta resolução
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe(process.env.STRIPE_BASIC_PRICE_ID)}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
            >
              {t('pricing.subscribe')}
            </button>
          </div>
          
          {/* Plano Pro */}
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl shadow-2xl p-8 border-2 border-orange-700 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-orange-900 px-4 py-1 rounded-bl-lg rounded-tr-lg font-bold text-sm">
              POPULAR
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">{t('pricing.pro.name')}</h2>
            <div className="text-4xl font-bold text-white mb-4">
              R$ 149,90<span className="text-lg text-orange-100">/mês</span>
            </div>
            <ul className="space-y-3 mb-8 text-white">
              <li className="flex items-center">
                <span className="text-yellow-300 mr-2">✓</span>
                170 renderizações/mês
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-2">✓</span>
                Qualidade máxima (sem compressão)
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-2">✓</span>
                Download em alta resolução
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-2">✓</span>
                Suporte prioritário
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe(process.env.STRIPE_PRO_PRICE_ID)}
              className="w-full bg-white text-orange-600 py-3 rounded-lg hover:bg-gray-100 font-bold"
            >
              {t('pricing.subscribe')}
            </button>
          </div>
        </div>
        
        {/* Pacotes Extras */}
        <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-center">
            {t('pricing.extras.title')}
          </h3>
          <p className="text-center text-gray-600 mb-6">
            {t('pricing.extras.description')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-3xl font-bold text-orange-600">
              R$ 49,90
            </div>
            <div className="text-gray-600">
              por cada 20 renderizações extras
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 6.2. Criar Dashboard de Assinatura

**Arquivo**: `client/src/pages/DashboardPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [extraQuantity, setExtraQuantity] = useState(1);
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    const response = await fetch('/api/user/me');
    const data = await response.json();
    setUser(data);
  };
  
  const handleBuyExtra = async () => {
    try {
      const response = await fetch('/api/subscriptions/buy-extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: extraQuantity }),
      });
      
      const { url } = await response.json();
      window.location.href = url; // Redirecionar para Stripe Checkout
    } catch (error) {
      console.error('Failed to buy extra pack:', error);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!confirm(t('dashboard.cancel_confirm'))) return;
    
    try {
      await fetch('/api/subscriptions/cancel', { method: 'POST' });
      alert(t('dashboard.cancel_success'));
      fetchUserData();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };
  
  if (!user) return <div>Loading...</div>;
  
  const usagePercent = (user.monthlyRendersUsed / user.monthlyQuota) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t('dashboard.title')}</h1>
        
        {/* Informações do Plano */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.plan')}</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold capitalize">{user.plan}</div>
              <div className="text-gray-600">
                {user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Renovação</div>
              <div className="font-bold">
                {new Date(user.billingPeriodEnd).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          
          {/* Barra de Uso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{t('dashboard.usage')}</span>
              <span>{user.monthlyRendersUsed} / {user.monthlyQuota}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-orange-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Renderizações Extras */}
          {user.extraRenders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Renderizações Extras</span>
                <span className="text-2xl font-bold text-orange-600">
                  {user.extraRenders}
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleCancelSubscription}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            {t('dashboard.cancel')}
          </button>
        </div>
        
        {/* Comprar Pacote Extra */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.buy_extra')}</h2>
          <p className="text-gray-600 mb-4">
            Precisa de mais renderizações este mês? Compre pacotes extras!
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="font-medium">Quantidade de pacotes:</label>
            <select
              value={extraQuantity}
              onChange={(e) => setExtraQuantity(parseInt(e.target.value))}
              className="border rounded-lg px-4 py-2"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>
                  {n} pacote{n > 1 ? 's' : ''} ({n * 20} renderizações)
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg">Total:</span>
            <span className="text-3xl font-bold text-orange-600">
              R$ {(extraQuantity * 49.90).toFixed(2)}
            </span>
          </div>
          
          <button
            onClick={handleBuyExtra}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700"
          >
            Comprar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 6.3. Atualizar Botão de Download

**Arquivo**: `client/src/pages/HistoryPage.tsx`

```typescript
// Adicionar verificação de plano antes de mostrar botão
const canDownloadHighRes = user?.plan === 'pro';

// No JSX, condicionar botão
{canDownloadHighRes ? (
  <button
    onClick={() => handleDownload(render)}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
  >
    <Download size={20} />
    {t('history.download_high_res')}
  </button>
) : (
  <div className="relative group">
    <button
      disabled
      className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
    >
      <Download size={20} />
      {t('history.download_high_res')}
    </button>
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      Disponível apenas no plano Pro
    </div>
  </div>
)}
```

---

### **FASE 7: Traduções** (Estimativa: 1 hora)

**Arquivo**: `client/src/contexts/LanguageContext.tsx`

Adicionar chaves:

```typescript
// PT-BR
pricing: {
  title: "Escolha Seu Plano",
  subtitle: "Renderizações ilimitadas de qualidade profissional",
  basic: {
    name: "Basic",
  },
  pro: {
    name: "Pro",
  },
  subscribe: "Assinar Agora",
  extras: {
    title: "Precisa de Mais?",
    description: "Compre pacotes extras de 20 renderizações",
  },
},
dashboard: {
  title: "Minha Assinatura",
  plan: "Plano Atual",
  usage: "Uso Mensal",
  cancel: "Cancelar Assinatura",
  cancel_confirm: "Tem certeza que deseja cancelar? Você perderá acesso ao final do período.",
  cancel_success: "Assinatura cancelada com sucesso",
  buy_extra: "Comprar Renderizações Extras",
},
history: {
  download_high_res: "Download Alta Resolução",
},

// EN
pricing: {
  title: "Choose Your Plan",
  subtitle: "Unlimited professional quality renderings",
  basic: {
    name: "Basic",
  },
  pro: {
    name: "Pro",
  },
  subscribe: "Subscribe Now",
  extras: {
    title: "Need More?",
    description: "Buy extra packs of 20 renderings",
  },
},
dashboard: {
  title: "My Subscription",
  plan: "Current Plan",
  usage: "Monthly Usage",
  cancel: "Cancel Subscription",
  cancel_confirm: "Are you sure you want to cancel? You'll lose access at the end of the period.",
  cancel_success: "Subscription canceled successfully",
  buy_extra: "Buy Extra Renderings",
},
history: {
  download_high_res: "Download High Resolution",
},
```

---

### **FASE 8: Testes e Validação** (Estimativa: 2-3 horas)

#### 8.1. Checklist de Testes

- [ ] Criar assinatura Basic
- [ ] Criar assinatura Pro
- [ ] Renderizar imagem no plano Basic (verificar compressão)
- [ ] Renderizar imagem no plano Pro (verificar qualidade máxima)
- [ ] Atingir limite de quota mensal
- [ ] Comprar pacote extra
- [ ] Usar renderizações extras
- [ ] Cancelar assinatura
- [ ] Webhook de renovação mensal (reset quota)
- [ ] Webhook de pagamento falho
- [ ] Botão de download oculto para Basic
- [ ] Botão de download visível para Pro
- [ ] Todas as traduções PT-BR/EN funcionando
- [ ] Nenhuma menção a "Renderização Avançada" visível

---

## 📊 Resumo de Estimativas

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Remoção de "Renderização Avançada" | 1-2 horas |
| 2 | Schema do Banco | 30 min |
| 3 | Configuração Stripe | 1 hora |
| 4 | Backend - Lógica | 3-4 horas |
| 5 | Controle de Qualidade | 2-3 horas |
| 6 | Frontend - Páginas | 4-5 horas |
| 7 | Traduções | 1 hora |
| 8 | Testes | 2-3 horas |
| **TOTAL** | | **15-21 horas** |

---

## 🚀 Ordem de Implementação Recomendada

1. **FASE 1** - Remoção de "Renderização Avançada" (pode ser feita independentemente)
2. **FASE 2** - Schema do Banco (base para tudo)
3. **FASE 3** - Configuração Stripe (obter Price IDs)
4. **FASE 4** - Backend - Lógica de Assinatura
5. **FASE 5** - Controle de Qualidade de Imagem
6. **FASE 6** - Frontend - Páginas de Assinatura
7. **FASE 7** - Traduções
8. **FASE 8** - Testes e Validação

---

## ⚠️ Pontos de Atenção

1. **Migração de Usuários Existentes**
   - Decidir o que fazer com usuários que têm tokens
   - Opção 1: Converter tokens em renderizações (1 token = 1 render)
   - Opção 2: Dar plano gratuito temporário
   - Opção 3: Forçar escolha de plano

2. **Webhook do Stripe**
   - Configurar URL pública acessível
   - Testar com Stripe CLI localmente
   - Validar assinatura do webhook

3. **Compressão de Imagem**
   - Testar qualidade visual após compressão
   - Ajustar parâmetros se necessário
   - Considerar WebP para melhor compressão

4. **Período de Transição**
   - Comunicar mudanças aos usuários existentes
   - Dar período de adaptação (ex: 30 dias)
   - Manter sistema de tokens em paralelo temporariamente

---

## 📝 Variáveis de Ambiente Necessárias

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_BASIC_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_EXTRA_PACK_PRICE_ID=price_xxxxx

# RapidAPI
RAPIDAPI_KEY=xxxxx

# App
VITE_APP_URL=https://seu-dominio.com
```

---

## ✅ Próximos Passos

Após revisar este plano:

1. Aprovar ou solicitar ajustes
2. Começar implementação pela FASE 1
3. Revisar cada fase antes de avançar
4. Testar incrementalmente
5. Deploy em produção após todos os testes

---

**Criado em**: 28 de outubro de 2025  
**Versão**: 1.0

