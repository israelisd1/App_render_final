# Guia de Configuração do Webhook Stripe

Este documento fornece instruções detalhadas para configurar o webhook do Stripe que permite ao Arqrender receber notificações automáticas sobre eventos de pagamento e assinatura.

---

## Por que configurar o webhook?

O webhook do Stripe é essencial para que o sistema funcione automaticamente. Sem ele, os seguintes recursos **não funcionarão**:

- ✉️ **Emails automáticos** (boas-vindas, confirmação de pagamento, alertas de falha)
- 💳 **Atualização automática de assinaturas** no banco de dados
- 🔄 **Reset de quota mensal** quando a assinatura renova
- ⚠️ **Detecção de pagamentos falhados** e ações corretivas

Com o webhook configurado, todos esses processos acontecem automaticamente sem intervenção manual.

---

## Informações necessárias

Antes de começar, tenha em mãos:

| Item | Valor |
|------|-------|
| **URL do webhook** | `https://archrender-mjzsrrst.manus.space/api/stripe/webhook` |
| **Ambiente** | Produção (Live Mode) |
| **Versão da API** | Última versão (recomendado) |

---

## Passo a passo

### 1. Acessar o Stripe Dashboard

Acesse [dashboard.stripe.com](https://dashboard.stripe.com) e faça login com sua conta do Stripe.

**Importante:** Certifique-se de estar no modo **Live** (produção), não no modo **Test**. Você pode verificar isso no canto superior direito do dashboard.

### 2. Navegar para Webhooks

No menu lateral esquerdo, clique em:

```
Developers → Webhooks
```

Você verá uma lista de webhooks existentes (se houver) ou uma tela vazia se for a primeira vez.

### 3. Adicionar endpoint

Clique no botão **"Add endpoint"** (Adicionar endpoint) no canto superior direito.

### 4. Configurar o endpoint

Preencha os campos conforme abaixo:

#### **Endpoint URL**
```
https://archrender-mjzsrrst.manus.space/api/stripe/webhook
```

**Atenção:** Certifique-se de que a URL está correta. Qualquer erro aqui impedirá o funcionamento do webhook.

#### **Description** (opcional)
```
Arqrender - Webhook de produção para processar eventos de assinatura e pagamento
```

#### **Version** (Versão da API)
Selecione a opção **"Use your account's default API version"** (Usar versão padrão da API da conta).

### 5. Selecionar eventos

Na seção **"Select events to listen to"** (Selecionar eventos para ouvir), clique em **"Select events"**.

Você verá uma lista com centenas de eventos disponíveis. **Selecione apenas os seguintes 6 eventos:**

| Evento | Descrição | Quando é disparado |
|--------|-----------|-------------------|
| `checkout.session.completed` | Checkout concluído | Quando usuário completa pagamento inicial |
| `customer.subscription.created` | Assinatura criada | Quando nova assinatura é criada |
| `customer.subscription.updated` | Assinatura atualizada | Quando usuário muda de plano ou assinatura é renovada |
| `customer.subscription.deleted` | Assinatura cancelada | Quando assinatura é cancelada (fim do período) |
| `invoice.payment_succeeded` | Pagamento bem-sucedido | Quando renovação mensal é paga com sucesso |
| `invoice.payment_failed` | Falha no pagamento | Quando renovação mensal falha (cartão recusado, etc.) |

**Como selecionar:**

1. Use a barra de pesquisa para encontrar cada evento
2. Marque a caixa de seleção ao lado de cada um
3. Após selecionar os 6 eventos, clique em **"Add events"**

### 6. Finalizar criação

Após selecionar os eventos, você voltará para a tela de configuração do endpoint. Revise as informações:

- ✅ URL do endpoint está correta
- ✅ 6 eventos estão selecionados
- ✅ Modo **Live** está ativo

Clique no botão **"Add endpoint"** para finalizar.

### 7. Copiar o Signing Secret

Após criar o webhook, o Stripe mostrará uma tela com detalhes do endpoint. **Esta é a parte mais importante:**

1. Localize a seção **"Signing secret"**
2. Clique em **"Reveal"** (Revelar) para mostrar o secret
3. Clique no ícone de **copiar** para copiar o valor

O signing secret terá este formato:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ IMPORTANTE:** Guarde este valor em local seguro. Você precisará dele no próximo passo.

### 8. Configurar o secret no Management UI

Agora você precisa adicionar o signing secret nas variáveis de ambiente do Arqrender:

1. Abra o **Management UI** do Arqrender
2. Vá em **Settings → Secrets**
3. Procure pela variável `STRIPE_WEBHOOK_SECRET`
4. Se ela já existir, clique em **Edit** (Editar)
5. Se não existir, clique em **Add Secret** (Adicionar Secret)
6. Cole o valor do signing secret que você copiou
7. Clique em **Save** (Salvar)

O servidor reiniciará automaticamente em 30-60 segundos.

### 9. Testar o webhook

Após configurar o secret, volte ao Stripe Dashboard na página do webhook que você criou.

1. Role até a seção **"Send test webhook"** (Enviar webhook de teste)
2. Selecione o evento `checkout.session.completed`
3. Clique em **"Send test webhook"**

Se tudo estiver configurado corretamente, você verá:

- ✅ Status: **Succeeded** (Sucesso)
- ✅ Response code: **200**

Se houver erro:

- ❌ Verifique se a URL do webhook está correta
- ❌ Verifique se o `STRIPE_WEBHOOK_SECRET` foi configurado corretamente
- ❌ Aguarde 1-2 minutos após salvar o secret (servidor pode estar reiniciando)

---

## Verificação final

Para confirmar que tudo está funcionando:

### 1. Verificar logs do webhook

No Stripe Dashboard, na página do webhook, você verá uma seção **"Recent events"** (Eventos recentes). Cada evento processado aparecerá aqui com:

- ✅ **Timestamp** (data e hora)
- ✅ **Event type** (tipo de evento)
- ✅ **Response code** (código de resposta)

Todos os eventos bem-sucedidos devem mostrar **200 OK**.

### 2. Fazer um teste real (opcional)

Se quiser testar com um pagamento real:

1. Acesse a página de planos do Arqrender em modo anônimo (navegador privado)
2. Faça login com uma conta de teste
3. Clique em **"Assinar Basic"** ou **"Assinar Pro"**
4. Complete o checkout com um cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura
   - CVC: Qualquer 3 dígitos
   - CEP: Qualquer CEP válido

5. Após completar o pagamento, verifique:
   - ✅ Email de boas-vindas recebido
   - ✅ Assinatura aparece na página `/subscription`
   - ✅ Quota mensal atualizada no banco de dados

---

## Solução de problemas

### Erro 401 Unauthorized

**Causa:** O `STRIPE_WEBHOOK_SECRET` está incorreto ou não foi configurado.

**Solução:**
1. Volte ao Stripe Dashboard → Webhooks
2. Clique no webhook que você criou
3. Copie novamente o signing secret
4. Atualize no Management UI → Settings → Secrets
5. Aguarde o servidor reiniciar

### Erro 404 Not Found

**Causa:** A URL do webhook está incorreta.

**Solução:**
1. Verifique se a URL é exatamente: `https://archrender-mjzsrrst.manus.space/api/stripe/webhook`
2. Certifique-se de que não há espaços extras no início ou fim
3. Verifique se o domínio está correto (pode ter mudado se você configurou domínio customizado)

### Erro 500 Internal Server Error

**Causa:** Erro no código do servidor ao processar o webhook.

**Solução:**
1. Verifique os logs do servidor no Management UI → Dashboard
2. Procure por erros relacionados ao webhook
3. Se o erro persistir, entre em contato com o suporte

### Eventos não estão sendo processados

**Causa:** O webhook pode estar configurado no modo **Test** ao invés de **Live**.

**Solução:**
1. No Stripe Dashboard, verifique se você está no modo **Live** (canto superior direito)
2. Se estiver no modo **Test**, mude para **Live**
3. Recrie o webhook no modo **Live**

---

## Monitoramento contínuo

Após configurar o webhook, é importante monitorar seu funcionamento:

### 1. Verificar taxa de sucesso

No Stripe Dashboard → Webhooks, você pode ver estatísticas de:

- **Success rate** (Taxa de sucesso): Deve estar acima de 99%
- **Average response time** (Tempo médio de resposta): Deve estar abaixo de 2 segundos

Se a taxa de sucesso estiver baixa, investigue os logs para identificar o problema.

### 2. Configurar alertas (opcional)

O Stripe pode enviar alertas por email quando:

- Taxa de sucesso cai abaixo de um limite
- Muitos eventos estão falhando

Para configurar:

1. Stripe Dashboard → Webhooks
2. Clique no webhook
3. Vá em **"Settings"** (Configurações)
4. Ative **"Email notifications"** (Notificações por email)

---

## Segurança

O webhook do Stripe usa assinatura criptográfica para garantir que os eventos são legítimos. O sistema Arqrender já implementa esta verificação automaticamente usando o `STRIPE_WEBHOOK_SECRET`.

**Nunca:**

- ❌ Compartilhe o signing secret publicamente
- ❌ Comite o signing secret no código-fonte
- ❌ Use o mesmo secret em múltiplos ambientes (desenvolvimento, staging, produção)

**Sempre:**

- ✅ Mantenha o secret seguro no Management UI → Secrets
- ✅ Use secrets diferentes para cada ambiente
- ✅ Regenere o secret se houver suspeita de comprometimento

---

## Próximos passos

Após configurar o webhook com sucesso:

1. ✅ **Teste o fluxo completo** fazendo uma assinatura de teste
2. ✅ **Monitore os emails** para confirmar que estão sendo enviados
3. ✅ **Verifique o banco de dados** para confirmar que as assinaturas estão sendo atualizadas
4. ✅ **Configure alertas** para ser notificado sobre problemas

---

## Suporte

Se encontrar problemas durante a configuração:

1. Consulte a [documentação oficial do Stripe sobre webhooks](https://stripe.com/docs/webhooks)
2. Verifique os logs do servidor no Management UI
3. Entre em contato com o suporte técnico do Arqrender

---

**Documento criado por:** Manus AI  
**Última atualização:** 10/11/2025  
**Versão:** 1.0
