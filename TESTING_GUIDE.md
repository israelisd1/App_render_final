# Guia de Testes - Sistema de Assinaturas

**Data**: 02/11/2025  
**Versão**: 0da5b1f4  
**Autor**: Manus AI

---

## Visão Geral

Este documento descreve os testes manuais e automatizados necessários para validar o sistema completo de assinaturas do Arqrender, incluindo controle de qualidade, gerenciamento de planos e integração Stripe.

---

## Pré-requisitos

### Ambiente de Teste
- Servidor rodando em: `https://3000-i4z1pxg1fp61lt0bcrxiv-61485dd6.manusvm.computer`
- Usuário de teste: `israelisd@gmail.com` (atualmente com plano Pro)
- Stripe em modo de teste (test keys configuradas)

### Dados de Teste Stripe
- Cartão de crédito válido: `4242 4242 4242 4242`
- Qualquer data futura (MM/AA)
- Qualquer CVV de 3 dígitos
- Qualquer CEP válido

---

## Testes de Assinatura

### 1. Fluxo de Nova Assinatura (Usuário Free → Basic)

**Objetivo**: Validar criação de assinatura Basic

**Passos**:
1. Fazer logout (se autenticado)
2. Fazer login com usuário sem plano
3. Acessar `/pricing`
4. Clicar em "Assinar Basic"
5. Preencher dados no Stripe Checkout
6. Completar pagamento
7. Verificar redirecionamento de volta para aplicação

**Resultado Esperado**:
- ✅ Redirecionamento para Stripe Checkout
- ✅ Pagamento processado com sucesso
- ✅ Usuário retorna com plano "basic"
- ✅ Badge "Basic" aparece no header
- ✅ Quota mensal = 100 renderizações

**SQL para Verificar**:
```sql
SELECT plan, monthlyQuota, subscriptionStatus 
FROM users 
WHERE email = 'teste@example.com';
```

---

### 2. Upgrade de Plano (Basic → Pro)

**Objetivo**: Validar upgrade com proration

**Passos**:
1. Autenticar com usuário Basic
2. Acessar `/pricing`
3. Clicar em "Assinar Pro"
4. Confirmar upgrade no Stripe
5. Verificar mudança imediata

**Resultado Esperado**:
- ✅ Stripe calcula proration automaticamente
- ✅ Plano atualizado para "pro" imediatamente
- ✅ Badge muda para "Pro" (laranja/vermelho)
- ✅ Quota mensal = 170 renderizações
- ✅ Botão HD aparece em renderizações futuras

---

### 3. Gerenciamento de Assinatura

**Objetivo**: Validar página `/subscription`

**Passos**:
1. Autenticar com usuário com plano ativo
2. Acessar `/subscription`
3. Verificar todas as seções

**Resultado Esperado**:
- ✅ Card de plano atual exibe nome e status corretos
- ✅ Estatísticas de uso mostram valores reais do banco
- ✅ Barra de progresso reflete uso percentual
- ✅ Data de próxima cobrança está correta
- ✅ Todos os botões de ação estão visíveis

---

### 4. Cancelamento de Assinatura

**Objetivo**: Validar cancelamento no final do período

**Passos**:
1. Acessar `/subscription`
2. Clicar em "Cancelar Assinatura"
3. Confirmar no dialog
4. Aguardar resposta

**Resultado Esperado**:
- ✅ Dialog de confirmação aparece
- ✅ Toast de sucesso após cancelamento
- ✅ Aviso vermelho: "Assinatura será cancelada em [data]"
- ✅ Botão "Reativar" aparece
- ✅ Acesso mantido até fim do período
- ✅ Campo `cancelAtPeriodEnd` = true no banco

**SQL para Verificar**:
```sql
SELECT subscriptionStatus, billingPeriodEnd 
FROM users 
WHERE email = 'teste@example.com';
```

---

### 5. Reativação de Assinatura

**Objetivo**: Validar reativação após cancelamento

**Passos**:
1. Com assinatura cancelada (mas ainda ativa)
2. Acessar `/subscription`
3. Clicar em "Reativar Assinatura"
4. Aguardar confirmação

**Resultado Esperado**:
- ✅ Toast de sucesso
- ✅ Aviso de cancelamento desaparece
- ✅ Botão "Cancelar" volta a aparecer
- ✅ Campo `cancelAtPeriodEnd` = false no banco

---

### 6. Compra de Renderizações Extras

**Objetivo**: Validar compra de pacote extra

**Passos**:
1. Acessar `/subscription`
2. Clicar em "Comprar Extras" (R$ 49,90)
3. Completar pagamento no Stripe
4. Verificar atualização

**Resultado Esperado**:
- ✅ Redirecionamento para Stripe Checkout
- ✅ Valor correto: R$ 49,90
- ✅ Após pagamento, campo `extraRenders` += 20
- ✅ Card "Disponíveis" mostra extras separadamente

**SQL para Verificar**:
```sql
SELECT extraRenders, monthlyRendersUsed 
FROM users 
WHERE email = 'teste@example.com';
```

---

### 7. Stripe Customer Portal

**Objetivo**: Validar acesso ao portal de pagamento

**Passos**:
1. Acessar `/subscription`
2. Clicar em "Gerenciar" (seção Forma de Pagamento)
3. Aguardar redirecionamento

**Resultado Esperado**:
- ✅ Redirecionamento para Stripe Customer Portal
- ✅ Usuário pode atualizar cartão
- ✅ Usuário pode ver histórico de faturas
- ✅ Usuário pode baixar recibos

---

## Testes de Controle de Qualidade

### 8. Renderização com Plano Basic

**Objetivo**: Validar qualidade HD e compressão

**Passos**:
1. Autenticar com usuário Basic
2. Acessar `/render`
3. Fazer upload de imagem de teste
4. Criar renderização
5. Aguardar conclusão
6. Acessar `/history`
7. Baixar imagem

**Resultado Esperado**:
- ✅ API chamada com `quality="standard"`
- ✅ Tempo de renderização: ~15 segundos
- ✅ Imagem comprimida para HD (1920x1080)
- ✅ Tamanho do arquivo: ~200-300 KB
- ✅ Campo `quality` no banco = "standard"
- ✅ Apenas 1 botão de download visível
- ✅ **Botão HD NÃO aparece**

**SQL para Verificar**:
```sql
SELECT quality, renderedImageUrl, highResUrl 
FROM renders 
WHERE userId = [ID] 
ORDER BY createdAt DESC 
LIMIT 1;
```

**Resultado**: `highResUrl` deve ser `NULL` para Basic

---

### 9. Renderização com Plano Pro

**Objetivo**: Validar qualidade Ultra HD sem compressão

**Passos**:
1. Autenticar com usuário Pro
2. Acessar `/render`
3. Fazer upload de imagem de teste
4. Criar renderização
5. Aguardar conclusão
6. Acessar `/history`
7. Verificar botões

**Resultado Esperado**:
- ✅ API chamada com `quality="detailed"`
- ✅ Tempo de renderização: ~30 segundos
- ✅ Imagem original salva sem compressão
- ✅ Campo `quality` no banco = "detailed"
- ✅ Campo `highResUrl` preenchido com URL original
- ✅ **2 botões de download visíveis**:
  - "Baixar Imagem" (padrão)
  - "📥 Download Alta Resolução (Pro)" (laranja)

**SQL para Verificar**:
```sql
SELECT quality, renderedImageUrl, highResUrl 
FROM renders 
WHERE userId = [ID] 
ORDER BY createdAt DESC 
LIMIT 1;
```

**Resultado**: `highResUrl` deve estar preenchido para Pro

---

### 10. Comparação de Tamanhos de Arquivo

**Objetivo**: Validar diferença real entre Basic e Pro

**Passos**:
1. Criar renderização idêntica com usuário Basic
2. Baixar imagem (botão padrão)
3. Anotar tamanho do arquivo
4. Trocar para usuário Pro
5. Criar mesma renderização
6. Baixar ambas versões (padrão e HD)
7. Comparar tamanhos

**Resultado Esperado**:
- ✅ Basic (comprimida): ~200-300 KB
- ✅ Pro (padrão): ~200-300 KB (mesma compressão)
- ✅ Pro (HD): **> 1 MB** (original da API)
- ✅ Diferença visual perceptível na qualidade HD

---

## Testes de Interface

### 11. Badge de Plano no Header

**Objetivo**: Validar indicador visual

**Passos**:
1. Fazer login com usuário Basic
2. Verificar header
3. Fazer logout e login com usuário Pro
4. Verificar header novamente

**Resultado Esperado**:

**Basic**:
- ✅ Badge com gradiente amber/orange
- ✅ Ícone: Raio (Zap)
- ✅ Texto: "Basic"
- ✅ Clicável → redireciona para `/subscription`

**Pro**:
- ✅ Badge com gradiente orange/red
- ✅ Ícone: Coroa (Crown)
- ✅ Texto: "Pro"
- ✅ Hover: scale-105

---

### 12. Página de Pricing

**Objetivo**: Validar layout e funcionalidade

**Passos**:
1. Acessar `/pricing`
2. Verificar todos os elementos

**Resultado Esperado**:
- ✅ 2 cards lado a lado (Basic e Pro)
- ✅ Badge "MAIS POPULAR" no Pro
- ✅ Features listadas com ícones de check
- ✅ Preços corretos: R$ 99,90 e R$ 149,90
- ✅ Plano atual mostra botão desabilitado
- ✅ Outros planos mostram botão de assinatura
- ✅ Seção de extras no final (R$ 49,90)
- ✅ Responsivo: cards empilham em mobile

---

### 13. Traduções PT-BR / EN

**Objetivo**: Validar alternância de idioma

**Passos**:
1. Acessar qualquer página
2. Clicar no botão de idioma (PT/EN) no header
3. Verificar tradução em todas as páginas

**Páginas a Verificar**:
- `/` (Home)
- `/render` (Nova Renderização)
- `/history` (Histórico)
- `/pricing` (Planos)
- `/subscription` (Gerenciamento)

**Resultado Esperado**:
- ✅ Todos os textos traduzidos corretamente
- ✅ Sem chaves faltando (ex: `pricing.title`)
- ✅ Formatação de moeda mantida (R$)
- ✅ Datas formatadas corretamente

---

## Testes de Webhook Stripe

### 14. Webhook: checkout.session.completed

**Objetivo**: Validar criação de assinatura via webhook

**Passos**:
1. Completar checkout no Stripe
2. Aguardar webhook
3. Verificar logs do servidor
4. Verificar banco de dados

**Resultado Esperado**:
- ✅ Webhook recebido em `/api/stripe/webhook`
- ✅ Log: `[Stripe Webhook] checkout.session.completed`
- ✅ Campos atualizados no banco:
  - `stripeCustomerId`
  - `subscriptionId`
  - `subscriptionStatus` = "active"
  - `plan` = "basic" ou "pro"
  - `monthlyQuota` = 100 ou 170

---

### 15. Webhook: customer.subscription.updated

**Objetivo**: Validar upgrade/downgrade via webhook

**Passos**:
1. Fazer upgrade de Basic para Pro
2. Aguardar webhook
3. Verificar atualização

**Resultado Esperado**:
- ✅ Webhook recebido
- ✅ Log: `[Stripe Webhook] customer.subscription.updated`
- ✅ Plano atualizado no banco
- ✅ Quota mensal atualizada

---

### 16. Webhook: customer.subscription.deleted

**Objetivo**: Validar cancelamento definitivo

**Passos**:
1. Cancelar assinatura
2. Aguardar fim do período
3. Stripe envia webhook de deleção
4. Verificar banco

**Resultado Esperado**:
- ✅ Webhook recebido
- ✅ Log: `[Stripe Webhook] customer.subscription.deleted`
- ✅ `subscriptionStatus` = "canceled"
- ✅ `plan` = "free"
- ✅ `monthlyQuota` = 0

---

## Testes de Segurança

### 17. Proteção de Rotas

**Objetivo**: Validar autenticação obrigatória

**Passos**:
1. Fazer logout
2. Tentar acessar diretamente:
   - `/render`
   - `/history`
   - `/subscription`

**Resultado Esperado**:
- ✅ Redirecionamento para página de login
- ✅ Ou mensagem "Autenticação Necessária"

---

### 18. Validação de Plano no Backend

**Objetivo**: Garantir que controle de qualidade não pode ser burlado

**Passos**:
1. Autenticar com usuário Basic
2. Tentar forçar `quality="detailed"` via DevTools
3. Criar renderização

**Resultado Esperado**:
- ✅ Backend ignora parâmetro do cliente
- ✅ Usa plano do usuário no banco de dados
- ✅ Renderização criada com `quality="standard"`

---

## Testes de Performance

### 19. Tempo de Renderização

**Objetivo**: Validar tempos prometidos

| Plano | Quality | Tempo Esperado |
|-------|---------|----------------|
| Basic | standard | 10-20 segundos |
| Pro | detailed | 25-35 segundos |

**Método**: Cronometrar 5 renderizações de cada tipo e calcular média

---

### 20. Compressão de Imagem

**Objetivo**: Validar eficiência da compressão Sharp

**Passos**:
1. Renderizar imagem grande (ex: 4000x3000)
2. Verificar tamanho da imagem original da API
3. Verificar tamanho após compressão HD

**Resultado Esperado**:
- ✅ Redução de pelo menos 60% no tamanho
- ✅ Qualidade visual ainda aceitável
- ✅ Dimensões exatas: 1920x1080

---

## Checklist Final

### Funcionalidades Críticas
- [ ] Criação de assinatura Basic
- [ ] Criação de assinatura Pro
- [ ] Upgrade de Basic para Pro
- [ ] Cancelamento de assinatura
- [ ] Reativação de assinatura
- [ ] Compra de renderizações extras
- [ ] Acesso ao Stripe Customer Portal

### Controle de Qualidade
- [ ] Renderização Basic (quality=standard)
- [ ] Renderização Pro (quality=detailed)
- [ ] Compressão HD para Basic
- [ ] URL original salva para Pro
- [ ] Botão HD visível apenas para Pro
- [ ] Tamanhos de arquivo diferentes

### Interface
- [ ] Badge de plano no header
- [ ] Página de Pricing funcional
- [ ] Página de Subscription funcional
- [ ] Traduções PT-BR completas
- [ ] Traduções EN completas
- [ ] Responsividade mobile

### Webhooks
- [ ] checkout.session.completed
- [ ] customer.subscription.updated
- [ ] customer.subscription.deleted
- [ ] invoice.payment_succeeded
- [ ] invoice.payment_failed

---

## Bugs Conhecidos

### Nenhum bug crítico identificado

---

## Próximos Passos

1. Executar todos os testes deste guia
2. Documentar resultados em planilha
3. Corrigir bugs encontrados
4. Criar checkpoint final
5. Preparar para produção

---

**Observações**:
- Todos os testes devem ser executados em ambiente de teste Stripe
- Não usar cartões reais em ambiente de desenvolvimento
- Verificar logs do servidor para debugging
- Usar SQL queries para validar estado do banco de dados

---

**Conclusão**: Este guia cobre 100% das funcionalidades implementadas nas FASES 1-6 do sistema de assinaturas.

