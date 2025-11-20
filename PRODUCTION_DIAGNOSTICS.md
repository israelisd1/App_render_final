# Diagnóstico de Price IDs em Produção

## Como Testar se os Price IDs Estão Configurados

### Método 1: Console do Navegador (Mais Rápido)

1. Abra seu site de produção no navegador
2. Pressione `F12` para abrir o DevTools
3. Vá na aba **Console**
4. Cole e execute este comando:

```javascript
fetch('/api/trpc/subscription.prices')
  .then(r => r.json())
  .then(data => {
    console.log('=== PRICE IDS ===');
    console.log('Basic:', data.result.data.basic);
    console.log('Pro:', data.result.data.pro);
    console.log('Extra:', data.result.data.extra);
    
    // Validação
    const allConfigured = 
      data.result.data.basic && 
      data.result.data.pro && 
      data.result.data.extra;
    
    console.log('\n=== STATUS ===');
    if (allConfigured) {
      console.log('✅ Todos os Price IDs estão configurados!');
    } else {
      console.log('❌ Price IDs faltando:');
      if (!data.result.data.basic) console.log('  - STRIPE_PRICE_BASIC');
      if (!data.result.data.pro) console.log('  - STRIPE_PRICE_PRO');
      if (!data.result.data.extra) console.log('  - STRIPE_PRICE_EXTRA');
    }
  })
  .catch(err => console.error('Erro ao buscar prices:', err));
```

### Método 2: Teste via cURL

Se preferir testar via linha de comando:

```bash
curl -X GET https://SEU_DOMINIO.manus.space/api/trpc/subscription.prices | jq
```

**Substitua `SEU_DOMINIO` pela URL real do seu site.**

### Resultados Esperados

#### ✅ Configuração CORRETA:
```json
{
  "result": {
    "data": {
      "basic": "price_1SNOfLHQcWbIhpydePr8qlZE",
      "pro": "price_1SNOhfHQcWbIhpydChRAstFR",
      "extra": "price_1SNOjqHQcWbIhpyddZ91UGWV"
    }
  }
}
```

#### ❌ Configuração INCORRETA (strings vazias):
```json
{
  "result": {
    "data": {
      "basic": "",
      "pro": "",
      "extra": ""
    }
  }
}
```

## Interpretação dos Resultados

### Se retornar strings vazias (`""`)

**Problema:** As variáveis de ambiente não foram configuradas corretamente em produção.

**Solução:**
1. Vá em **Management UI → Settings → Secrets**
2. Verifique se as 3 variáveis existem:
   - `STRIPE_PRICE_BASIC`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_EXTRA`
3. Se não existirem, adicione-as
4. Se existirem, clique para editar e verifique se os valores estão corretos
5. **IMPORTANTE:** Após salvar, aguarde 30-60 segundos para o servidor reiniciar
6. Execute o teste novamente

### Se retornar os Price IDs corretos

**Problema:** As variáveis estão configuradas, mas pode haver outro erro.

**Próximos passos de diagnóstico:**

1. **Verificar logs do servidor:**
   - Vá em Management UI → Dashboard → Logs
   - Procure por erros relacionados a "Stripe" ou "checkout"

2. **Testar criação de checkout:**
   - Faça login no site
   - Vá para a página /pricing
   - Abra o DevTools (F12) → aba Network
   - Clique em "Assinar Basic"
   - Verifique se há erros na requisição

3. **Verificar STRIPE_SECRET_KEY:**
   - Se o checkout não abrir, pode ser problema com a chave secreta
   - Vá em Management UI → Settings → Secrets
   - Verifique se `STRIPE_SECRET_KEY` está configurada
   - Deve começar com `sk_live_` ou `sk_test_`

## Checklist Completo de Variáveis Stripe

Todas essas variáveis devem estar configuradas em **Management UI → Settings → Secrets**:

- [ ] `STRIPE_SECRET_KEY` - Chave secreta da API (sk_live_...)
- [ ] `STRIPE_PUBLISHABLE_KEY` - Chave pública (pk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` - Secret para webhooks (whsec_...)
- [ ] `STRIPE_PRICE_BASIC` - Price ID do plano Basic (price_...)
- [ ] `STRIPE_PRICE_PRO` - Price ID do plano Pro (price_...)
- [ ] `STRIPE_PRICE_EXTRA` - Price ID do pacote extra (price_...)

## Erros Comuns

### 1. Espaços extras nos valores
❌ `" price_1SNOfL... "` (com espaços)  
✅ `"price_1SNOfL..."` (sem espaços)

### 2. Usar Product ID ao invés de Price ID
❌ `prod_1SNOfL...` (Product ID - ERRADO)  
✅ `price_1SNOfL...` (Price ID - CORRETO)

### 3. Misturar chaves de teste e produção
❌ `sk_test_...` em produção  
✅ `sk_live_...` em produção

### 4. Não aguardar reinicialização do servidor
Após salvar variáveis, **aguarde 30-60 segundos** antes de testar.

## Teste Completo do Fluxo

Após confirmar que os Price IDs estão corretos:

1. ✅ Faça login no site de produção
2. ✅ Vá para /pricing
3. ✅ Clique em "Assinar Basic"
4. ✅ Verifique se abre o Stripe Checkout
5. ✅ Confirme que o preço está correto (R$ 99,90)
6. ✅ Verifique se seu email aparece automaticamente

Se todos os passos funcionarem, o sistema está 100% configurado!

## Suporte Adicional

Se após seguir todos os passos o problema persistir, colete as seguintes informações:

1. Resultado do teste de Price IDs (console do navegador)
2. Logs do servidor (Management UI → Dashboard → Logs)
3. Screenshot do erro na página /pricing
4. Lista de variáveis configuradas (sem mostrar os valores)

---

**Última atualização:** 09/11/2025 23:55  
**Versão do checkpoint:** 2443720b
