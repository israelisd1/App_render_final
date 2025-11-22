# 📡 API Reference (tRPC)

Documentação completa dos endpoints tRPC disponíveis na aplicação.

## 📋 Índice

- [Autenticação](#autenticação)
- [Renderização](#renderização)
- [Assinaturas](#assinaturas)
- [Perfil](#perfil)
- [Admin](#admin)
- [Sistema](#sistema)

## 🔐 Autenticação

### `auth.me`
Retorna informações do usuário autenticado.

**Tipo**: Query (público)

**Resposta**:
```typescript
{
  id: number;
  email: string;
  name: string;
  phone?: string;
  plan: 'free' | 'basic' | 'pro';
  tokenBalance: number;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'inactive';
  role: 'user' | 'admin';
}
```

**Exemplo**:
```typescript
const { user } = useAuth(); // Hook que usa auth.me internamente
```

### `auth.logout`
Faz logout do usuário.

**Tipo**: Mutation (público)

**Resposta**:
```typescript
{ success: true }
```

**Exemplo**:
```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

## 🎨 Renderização

### `render.create`
Cria uma nova renderização.

**Tipo**: Mutation (protegido)

**Input**:
```typescript
{
  sceneType: 'interior' | 'exterior';
  outputFormat: 'webp' | 'jpg' | 'png' | 'avif';
  imageBase64: string; // Data URL da imagem
  prompt?: string; // Prompt personalizado
}
```

**Resposta**:
```typescript
{
  renderId: number;
  status: 'processing';
}
```

**Exemplo**:
```typescript
const createRender = trpc.render.create.useMutation({
  onSuccess: (data) => {
    console.log('Render criado:', data.renderId);
  },
});

createRender.mutate({
  sceneType: 'interior',
  outputFormat: 'webp',
  imageBase64: 'data:image/png;base64,...',
  prompt: 'Modern living room with natural light',
});
```

### `render.list`
Lista renderizações do usuário.

**Tipo**: Query (protegido)

**Input**:
```typescript
{
  limit?: number; // Padrão: 50
  offset?: number; // Padrão: 0
}
```

**Resposta**:
```typescript
Array<{
  id: number;
  originalImageUrl: string;
  renderedImageUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  sceneType: 'interior' | 'exterior';
  outputFormat: string;
  quality: 'standard' | 'detailed';
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}>
```

**Exemplo**:
```typescript
const { data: renders } = trpc.render.list.useQuery({
  limit: 20,
  offset: 0,
});
```

### `render.getById`
Obtém detalhes de uma renderização específica.

**Tipo**: Query (protegido)

**Input**:
```typescript
{ renderId: number }
```

**Resposta**:
```typescript
{
  id: number;
  originalImageUrl: string;
  renderedImageUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  sceneType: 'interior' | 'exterior';
  outputFormat: string;
  quality: 'standard' | 'detailed';
  prompt?: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}
```

**Exemplo**:
```typescript
const { data: render } = trpc.render.getById.useQuery({
  renderId: 123,
});
```

## 💳 Assinaturas

### `subscription.prices`
Retorna Price IDs dos planos Stripe.

**Tipo**: Query (público)

**Resposta**:
```typescript
{
  basic: string; // price_1SNOfLHQcWbIhpydePr8qlZE
  pro: string;   // price_1SNOhfHQcWbIhpydChRAstFR
  extra: string; // price_1SNOjqHQcWbIhpyddZ91UGWV
}
```

**Exemplo**:
```typescript
const { data: prices } = trpc.subscription.prices.useQuery();
```

### `subscription.status`
Retorna status da assinatura do usuário.

**Tipo**: Query (protegido)

**Resposta**:
```typescript
{
  plan: 'free' | 'basic' | 'pro';
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'inactive';
  monthlyQuota: number;
  monthlyRendersUsed: number;
  extraRenders: number;
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  stripeCustomerId?: string;
  subscriptionId?: string;
}
```

**Exemplo**:
```typescript
const { data: status } = trpc.subscription.status.useQuery();
```

### `subscription.create`
Cria checkout para nova assinatura.

**Tipo**: Mutation (protegido)

**Input**:
```typescript
{ priceId: string }
```

**Resposta**:
```typescript
{ url: string } // URL do Stripe Checkout
```

**Exemplo**:
```typescript
const createCheckout = trpc.subscription.create.useMutation({
  onSuccess: (data) => {
    window.location.href = data.url;
  },
});

createCheckout.mutate({ 
  priceId: 'price_1SNOfLHQcWbIhpydePr8qlZE' 
});
```

### `subscription.cancel`
Cancela assinatura no final do período.

**Tipo**: Mutation (protegido)

**Resposta**:
```typescript
{ success: true }
```

**Exemplo**:
```typescript
const cancelSubscription = trpc.subscription.cancel.useMutation({
  onSuccess: () => {
    toast.success('Assinatura cancelada');
  },
});

cancelSubscription.mutate();
```

### `subscription.reactivate`
Reativa assinatura cancelada.

**Tipo**: Mutation (protegido)

**Resposta**:
```typescript
{ success: true }
```

**Exemplo**:
```typescript
const reactivate = trpc.subscription.reactivate.useMutation({
  onSuccess: () => {
    toast.success('Assinatura reativada');
  },
});

reactivate.mutate();
```

### `subscription.portal`
Abre Stripe Customer Portal.

**Tipo**: Mutation (protegido)

**Resposta**:
```typescript
{ url: string } // URL do Stripe Customer Portal
```

**Exemplo**:
```typescript
const openPortal = trpc.subscription.portal.useMutation({
  onSuccess: (data) => {
    window.location.href = data.url;
  },
});

openPortal.mutate();
```

### `subscription.buyExtra`
Compra pacote extra de renderizações.

**Tipo**: Mutation (protegido)

**Input**:
```typescript
{ quantity: number } // Mínimo: 20
```

**Resposta**:
```typescript
{ url: string } // URL do Stripe Checkout
```

**Exemplo**:
```typescript
const buyExtra = trpc.subscription.buyExtra.useMutation({
  onSuccess: (data) => {
    window.location.href = data.url;
  },
});

buyExtra.mutate({ quantity: 20 });
```

## 👤 Perfil

### `profile.update`
Atualiza informações do perfil.

**Tipo**: Mutation (protegido)

**Input**:
```typescript
{
  name?: string;
  phone?: string;
}
```

**Resposta**:
```typescript
{ success: true }
```

**Exemplo**:
```typescript
const updateProfile = trpc.profile.update.useMutation({
  onSuccess: () => {
    toast.success('Perfil atualizado');
  },
});

updateProfile.mutate({
  name: 'João Silva',
  phone: '+55 11 98765-4321',
});
```

## 👑 Admin

### `admin.users.list`
Lista todos os usuários (apenas admin).

**Tipo**: Query (protegido - admin)

**Input**:
```typescript
{
  limit?: number;
  offset?: number;
  search?: string;
}
```

**Resposta**:
```typescript
{
  users: Array<{
    id: number;
    email: string;
    name: string;
    plan: string;
    tokenBalance: number;
    subscriptionStatus?: string;
    role: string;
    createdAt: Date;
  }>;
  total: number;
}
```

**Exemplo**:
```typescript
const { data } = trpc.admin.users.list.useQuery({
  limit: 50,
  offset: 0,
  search: 'joao',
});
```

### `admin.users.updateRole`
Atualiza role de um usuário (apenas admin).

**Tipo**: Mutation (protegido - admin)

**Input**:
```typescript
{
  userId: number;
  role: 'user' | 'admin';
}
```

**Resposta**:
```typescript
{ success: true }
```

**Exemplo**:
```typescript
const updateRole = trpc.admin.users.updateRole.useMutation();

updateRole.mutate({
  userId: 123,
  role: 'admin',
});
```

### `admin.stats`
Retorna estatísticas do sistema (apenas admin).

**Tipo**: Query (protegido - admin)

**Resposta**:
```typescript
{
  totalUsers: number;
  activeSubscriptions: number;
  totalRenders: number;
  monthlyRevenue: number;
  rendersByDay: Array<{
    date: string;
    count: number;
  }>;
}
```

**Exemplo**:
```typescript
const { data: stats } = trpc.admin.stats.useQuery();
```

## ⚙️ Sistema

### `system.notifyOwner`
Envia notificação para o proprietário do sistema.

**Tipo**: Mutation (protegido)

**Input**:
```typescript
{
  title: string;
  content: string;
}
```

**Resposta**:
```typescript
{ success: boolean }
```

**Exemplo**:
```typescript
const notify = trpc.system.notifyOwner.useMutation();

notify.mutate({
  title: 'Novo feedback',
  content: 'Usuário reportou bug na página X',
});
```

## 🔧 Uso Avançado

### Invalidação de Cache

```typescript
const utils = trpc.useUtils();

// Invalidar query específica
await utils.render.list.invalidate();

// Invalidar todas as queries de render
await utils.render.invalidate();

// Refetch imediato
await utils.render.list.refetch();
```

### Optimistic Updates

```typescript
const utils = trpc.useUtils();

const updateProfile = trpc.profile.update.useMutation({
  onMutate: async (newData) => {
    // Cancelar queries em andamento
    await utils.auth.me.cancel();
    
    // Snapshot do valor anterior
    const previousUser = utils.auth.me.getData();
    
    // Atualizar otimisticamente
    utils.auth.me.setData(undefined, (old) => ({
      ...old!,
      ...newData,
    }));
    
    return { previousUser };
  },
  onError: (err, newData, context) => {
    // Reverter em caso de erro
    utils.auth.me.setData(undefined, context?.previousUser);
  },
  onSettled: () => {
    // Refetch após conclusão
    utils.auth.me.invalidate();
  },
});
```

### Prefetch

```typescript
const utils = trpc.useUtils();

// Prefetch antes de navegar
await utils.render.list.prefetch({ limit: 20 });
```

## 🚨 Tratamento de Erros

```typescript
const mutation = trpc.render.create.useMutation({
  onError: (error) => {
    if (error.data?.code === 'BAD_REQUEST') {
      toast.error('Saldo insuficiente');
    } else if (error.data?.code === 'UNAUTHORIZED') {
      toast.error('Faça login para continuar');
    } else {
      toast.error('Erro ao criar renderização');
    }
  },
});
```

### Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| `UNAUTHORIZED` | Usuário não autenticado |
| `FORBIDDEN` | Usuário não tem permissão |
| `BAD_REQUEST` | Dados inválidos ou saldo insuficiente |
| `NOT_FOUND` | Recurso não encontrado |
| `INTERNAL_SERVER_ERROR` | Erro no servidor |

---

**Última atualização**: Novembro 2025  
**Versão**: 1.0.0
