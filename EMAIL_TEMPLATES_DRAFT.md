# 📧 Templates de Email - Para Validação

Textos dos emails de notificação do sistema. Por favor, revise e aprove antes da implementação.

---

## 1. 🎉 Boas-vindas - Assinatura Ativada

**Assunto**: Bem-vindo ao Arqrender {{plano}}! Sua assinatura está ativa

**Corpo**:

Olá {{nome}},

Sua assinatura do plano **{{plano}}** foi ativada com sucesso! Estamos muito felizes em tê-lo conosco.

**Detalhes da sua assinatura:**
- Plano: {{plano}}
- Quota mensal: {{quota}} renderizações
- Próxima cobrança: {{proximaCobranca}}
- Valor: R$ {{valor}}/mês

**O que você pode fazer agora:**
- Acesse sua conta e comece a renderizar seus projetos
- Explore as funcionalidades do seu plano
- Gerencie sua assinatura a qualquer momento em https://archrender-mjzsrrst.manus.space/subscription

Se tiver alguma dúvida ou precisar de ajuda, estamos à disposição!

Boas renderizações,  
Equipe Arqrender

---

## 2. ✅ Pagamento Bem-sucedido

**Assunto**: Pagamento confirmado - Arqrender {{plano}}

**Corpo**:

Olá {{nome}},

Seu pagamento foi processado com sucesso! Sua assinatura do plano **{{plano}}** foi renovada.

**Detalhes do pagamento:**
- Valor: R$ {{valor}}
- Data: {{data}}
- Método: {{metodoPagamento}}
- Próxima cobrança: {{proximaCobranca}}

**Sua quota mensal foi resetada:**
- Quota disponível: {{quota}} renderizações
- Renderizações extras acumuladas: {{extras}}

Você pode visualizar o recibo completo acessando: {{linkRecibo}}

Continue criando renderizações incríveis!

Equipe Arqrender

---

## 3. ❌ Falha no Pagamento

**Assunto**: Ação necessária: Falha no pagamento - Arqrender

**Corpo**:

Olá {{nome}},

Infelizmente, não conseguimos processar o pagamento da sua assinatura do plano **{{plano}}**.

**Detalhes:**
- Valor: R$ {{valor}}
- Data da tentativa: {{data}}
- Motivo: {{motivo}}

**O que fazer agora:**

Sua assinatura continuará ativa por mais alguns dias enquanto tentamos processar o pagamento novamente. Para evitar a interrupção do serviço, por favor:

1. Acesse https://archrender-mjzsrrst.manus.space/subscription
2. Clique em "Gerenciar" para atualizar seu método de pagamento
3. Ou entre em contato conosco se precisar de ajuda

**Importante**: Se o pagamento não for regularizado em até 7 dias, sua assinatura será cancelada automaticamente e você voltará para o plano gratuito.

Estamos aqui para ajudar!

Equipe Arqrender

---

## 4. ⚠️ Alerta de Quota (90%)

**Assunto**: Sua quota mensal está quase acabando - Arqrender

**Corpo**:

Olá {{nome}},

Você está usando sua quota de renderizações com sucesso! 🎉

**Status atual:**
- Plano: {{plano}}
- Quota mensal: {{quota}} renderizações
- Já utilizadas: {{utilizadas}} ({{porcentagem}}%)
- Restantes: {{restantes}}

**Próximas opções:**

**Opção 1: Aguardar renovação**  
Sua quota será resetada automaticamente em {{diasRestantes}} dias ({{dataRenovacao}}).

**Opção 2: Comprar pacote extra**  
Adicione 20 renderizações por R$ 49,90 (não expira):  
https://archrender-mjzsrrst.manus.space/pricing

**Opção 3: Fazer upgrade**  
Mude para o plano Pro e ganhe mais renderizações + qualidade MAX:  
https://archrender-mjzsrrst.manus.space/pricing

Continue criando!

Equipe Arqrender

---

## 5. 🔔 Assinatura Cancelada

**Assunto**: Confirmação de cancelamento - Arqrender

**Corpo**:

Olá {{nome}},

Confirmamos o cancelamento da sua assinatura do plano **{{plano}}**.

**Detalhes:**
- Sua assinatura permanecerá ativa até: {{dataFim}}
- Você ainda pode usar suas {{restantes}} renderizações restantes até lá
- Não haverá mais cobranças automáticas

**Após {{dataFim}}:**
- Você voltará para o plano gratuito
- Suas renderizações extras ({{extras}}) serão mantidas
- Você poderá reativar sua assinatura a qualquer momento

**Mudou de ideia?**  
Você pode reativar sua assinatura antes de {{dataFim}} acessando:  
https://archrender-mjzsrrst.manus.space/subscription

Sentiremos sua falta! Se houver algo que possamos melhorar, adoraríamos ouvir seu feedback.

Equipe Arqrender

---

## 📝 Observações para Implementação

### Variáveis Dinâmicas

Cada email usa variáveis que serão substituídas dinamicamente:

- `{{nome}}` - Nome do usuário
- `{{plano}}` - Basic ou Pro
- `{{quota}}` - Número de renderizações mensais
- `{{valor}}` - Valor em reais
- `{{proximaCobranca}}` - Data da próxima cobrança
- `{{data}}` - Data do evento
- `{{metodoPagamento}}` - Cartão final ****1234
- `{{linkRecibo}}` - Link para invoice do Stripe
- `{{motivo}}` - Motivo da falha (cartão recusado, saldo insuficiente, etc)
- `{{utilizadas}}` - Renderizações já usadas
- `{{porcentagem}}` - Porcentagem usada
- `{{restantes}}` - Renderizações restantes
- `{{diasRestantes}}` - Dias até renovação
- `{{dataRenovacao}}` - Data de renovação
- `{{dataFim}}` - Data de término da assinatura
- `{{extras}}` - Renderizações extras acumuladas

### Formato HTML

Os emails serão enviados em formato HTML com:
- Logo do Arqrender no topo
- Cores da marca (laranja #ea580c)
- Botões de ação destacados
- Design responsivo para mobile
- Footer com links úteis e redes sociais

### Gatilhos

1. **Boas-vindas**: Webhook `checkout.session.completed` (primeira assinatura)
2. **Pagamento bem-sucedido**: Webhook `invoice.payment_succeeded`
3. **Falha no pagamento**: Webhook `invoice.payment_failed`
4. **Alerta de quota**: Verificação após cada renderização (se >= 90%)
5. **Assinatura cancelada**: Endpoint `subscription.cancel` (confirmação imediata)

---

**Por favor, revise os textos e indique:**
- ✅ Aprovado como está
- ✏️ Sugestões de alteração
- ➕ Adicionar outros emails
