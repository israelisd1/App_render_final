# Configuração de Variáveis de Ambiente em Produção

## Problema

O ambiente de produção está retornando erro "Price ID não configurado" porque as variáveis de ambiente do Stripe não estão configuradas no servidor publicado.

## Solução

As variáveis de ambiente precisam ser configuradas através do **Management UI** do Manus.

### Passo a Passo

#### 1. Acessar o Management UI

- Clique no ícone de **engrenagem** (⚙️) no canto superior direito da interface do chat
- Ou clique em qualquer botão que abra o painel de gerenciamento

#### 2. Navegar para Secrets

- No menu lateral esquerdo, clique em **Settings**
- Depois clique em **Secrets**

#### 3. Adicionar/Atualizar as Variáveis do Stripe

Configure as seguintes variáveis de ambiente:

| Variável | Valor |
|----------|-------|
| `STRIPE_PRICE_BASIC` | `price_1SNOfLHQcWbIhpydePr8qlZE` |
| `STRIPE_PRICE_PRO` | `price_1SNOhfHQcWbIhpydChRAstFR` |
| `STRIPE_PRICE_EXTRA` | `price_1SNOjqHQcWbIhpyddZ91UGWV` |

**Para cada variável:**

1. Se a variável já existir:
   - Clique no ícone de **editar** (lápis) ao lado da variável
   - Atualize o valor
   - Clique em **Salvar**

2. Se a variável não existir:
   - Clique no botão **+ Add Secret** ou **Nova Variável**
   - Digite o nome da variável (ex: `STRIPE_PRICE_BASIC`)
   - Cole o valor correspondente
   - Clique em **Salvar**

#### 4. Aguardar Reinicialização

Após salvar todas as variáveis:

- O servidor será **reiniciado automaticamente**
- Aguarde 30-60 segundos para o servidor voltar online
- As novas variáveis estarão disponíveis para a aplicação

#### 5. Testar em Produção

1. Acesse a URL de produção do seu site
2. Faça login com sua conta
3. Vá para a página de **Planos** (/pricing)
4. Clique em **Assinar Basic** ou **Assinar Pro**
5. Verifique se o Stripe Checkout abre corretamente

## Verificação

Se tudo estiver correto, você verá:

✅ Página de planos carrega sem erros  
✅ Botões "Assinar" abrem o Stripe Checkout  
✅ Preços aparecem corretamente no checkout  
✅ Email do usuário é detectado automaticamente  

## Troubleshooting

### Erro persiste após configurar variáveis

1. Verifique se não há espaços extras no início/fim dos valores
2. Confirme que os Price IDs estão corretos (começam com `price_`)
3. Aguarde mais tempo para o servidor reiniciar completamente
4. Limpe o cache do navegador e recarregue a página

### Como verificar se as variáveis foram aplicadas

No Management UI, vá em **Settings → Secrets** e confirme que as três variáveis aparecem na lista com os valores corretos (os valores ficam ocultos por segurança, mas você pode editá-los para verificar).

## Observações Importantes

⚠️ **Nunca compartilhe** os Price IDs publicamente em repositórios Git ou documentação pública  
⚠️ **Sempre use** o Management UI para configurar variáveis sensíveis em produção  
⚠️ **Não edite** o arquivo `.env` diretamente no servidor de produção  

## Variáveis Já Configuradas

As seguintes variáveis do Stripe já devem estar configuradas (não precisam ser alteradas):

- `STRIPE_SECRET_KEY` - Chave secreta da API Stripe
- `STRIPE_PUBLISHABLE_KEY` - Chave pública da API Stripe
- `STRIPE_WEBHOOK_SECRET` - Secret para validar webhooks

## Próximos Passos

Após configurar as variáveis em produção:

1. Teste o fluxo completo de assinatura
2. Verifique se os webhooks do Stripe estão funcionando
3. Monitore os logs para garantir que não há erros
4. Faça um teste de pagamento real (pode cancelar depois)

---

**Última atualização:** 09/11/2025 23:50  
**Versão do checkpoint:** 2443720b
