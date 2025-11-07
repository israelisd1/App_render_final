# Configuração de Email para Reset de Senha

## Visão Geral

O sistema de reset de senha agora envia emails reais usando **Nodemailer**. O sistema funciona em dois modos:

1. **Modo Produção**: Envia emails reais via SMTP
2. **Modo Desenvolvimento**: Loga o link de reset no console do servidor

## Variáveis de Ambiente Necessárias

Para enviar emails reais, configure as seguintes variáveis de ambiente:

```bash
EMAIL_HOST=smtp.gmail.com          # Servidor SMTP
EMAIL_PORT=587                      # Porta SMTP (587 para TLS, 465 para SSL)
EMAIL_USER=seu-email@gmail.com     # Email de envio
EMAIL_PASSWORD=sua-senha-app        # Senha do email ou App Password
EMAIL_FROM=seu-email@gmail.com     # Email remetente (opcional, usa EMAIL_USER se não definido)
```

## Provedores de Email Recomendados

### 1. Gmail (Recomendado para Desenvolvimento)

**Configuração:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app-16-digitos
EMAIL_FROM=seu-email@gmail.com
```

**Como obter App Password:**
1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Gere uma senha para "Email"
5. Use essa senha de 16 dígitos no `EMAIL_PASSWORD`

**Limitações:**
- 500 emails por dia (conta gratuita)
- Pode ser bloqueado se enviar muitos emails rapidamente

### 2. SendGrid (Recomendado para Produção)

**Configuração:**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.sua-api-key-aqui
EMAIL_FROM=noreply@seudominio.com
```

**Vantagens:**
- 100 emails/dia grátis
- Infraestrutura profissional
- Relatórios de entrega

**Como configurar:**
1. Crie conta em [SendGrid](https://sendgrid.com/)
2. Crie API Key em Settings → API Keys
3. Use "apikey" como EMAIL_USER
4. Use a API Key como EMAIL_PASSWORD

### 3. Mailgun (Alternativa para Produção)

**Configuração:**
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@seudominio.mailgun.org
EMAIL_PASSWORD=sua-senha-mailgun
EMAIL_FROM=noreply@seudominio.com
```

**Vantagens:**
- 5.000 emails/mês grátis (primeiros 3 meses)
- Boa deliverability
- API robusta

### 4. AWS SES (Para Alto Volume)

**Configuração:**
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=suas-credenciais-smtp-iam
EMAIL_PASSWORD=sua-senha-smtp
EMAIL_FROM=noreply@seudominio.com
```

**Vantagens:**
- $0.10 por 1.000 emails
- Altamente escalável
- Integração com AWS

**Desvantagens:**
- Requer verificação de domínio
- Sandbox mode inicial (limite de 200 emails/dia)

## Modo Desenvolvimento (Sem Configuração)

Se você **não configurar** as variáveis de ambiente de email, o sistema funcionará em **modo desenvolvimento**:

- ✅ Não gera erros
- ✅ Gera token de reset normalmente
- ✅ Salva token no banco de dados
- ⚠️ **Não envia email real**
- 📝 Loga o link de reset no console do servidor

**Exemplo de log no console:**
```
================================================================================
[Email] MODO DESENVOLVIMENTO - Email não enviado
================================================================================
Para: teste@teste.com
Assunto: Redefinir Senha - Architecture Rendering App
Link de Reset: https://seuapp.com/reset-password?token=abc123...
Token: abc123...
================================================================================
```

## Testando o Sistema

### 1. Testar em Desenvolvimento (sem SMTP)

1. **Não configure** variáveis de email
2. Acesse `/forgot-password`
3. Digite um email cadastrado
4. Veja o link de reset no **console do servidor**
5. Copie o link e acesse manualmente

### 2. Testar em Produção (com SMTP)

1. Configure variáveis de email (ex: Gmail)
2. Reinicie o servidor
3. Acesse `/forgot-password`
4. Digite um email cadastrado
5. Verifique sua caixa de entrada
6. Clique no link recebido

## Troubleshooting

### Email não chega

**1. Verifique o console do servidor:**
```bash
# Procure por logs como:
[Email] Email de reset enviado para: email@exemplo.com
# ou
[Email] Erro ao enviar email: ...
```

**2. Verifique spam/lixo eletrônico**
- Emails de desenvolvimento podem cair no spam

**3. Verifique credenciais:**
```bash
# Teste SMTP manualmente
curl -v --url 'smtp://smtp.gmail.com:587' \
  --mail-from 'seu-email@gmail.com' \
  --mail-rcpt 'destinatario@gmail.com' \
  --user 'seu-email@gmail.com:sua-senha-app'
```

**4. Verifique logs de erro:**
- Gmail: Pode bloquear "apps menos seguros"
- SendGrid: Verifique quota e status da API Key

### Email enviado mas link não funciona

**1. Verifique NEXTAUTH_URL:**
```bash
# Deve ser a URL pública do seu app
NEXTAUTH_URL=https://seuapp.com
```

**2. Verifique expiração do token:**
- Tokens expiram em 1 hora
- Gere novo token se expirou

**3. Verifique banco de dados:**
```sql
SELECT * FROM users WHERE resetPasswordToken IS NOT NULL;
```

## Segurança

### Boas Práticas

1. **Nunca commite credenciais no Git**
   - Use `.env` local
   - Configure variáveis no servidor de produção

2. **Use App Passwords (Gmail)**
   - Não use senha principal da conta
   - Revogue se comprometida

3. **Limite rate de requisições**
   - Implemente rate limiting no endpoint `/api/auth/forgot-password`
   - Previne spam e ataques

4. **Monitore envios**
   - Acompanhe logs de email
   - Alerte sobre falhas

### Exemplo de Rate Limiting (Futuro)

```typescript
import rateLimit from 'express-rate-limit';

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // 3 requisições por IP
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});

app.post('/api/auth/forgot-password', forgotPasswordLimiter, async (req, res) => {
  // ...
});
```

## Custos Estimados

| Provedor | Grátis | Pago | Melhor Para |
|----------|--------|------|-------------|
| Gmail | 500/dia | N/A | Desenvolvimento |
| SendGrid | 100/dia | $19.95/mês (40k) | Pequenas empresas |
| Mailgun | 5k/mês (3 meses) | $35/mês (50k) | Médias empresas |
| AWS SES | 62k/mês (AWS Free Tier) | $0.10/1k | Alto volume |

## Próximos Passos

1. ✅ Sistema de email implementado
2. ⏳ Configurar provedor de email (Gmail/SendGrid)
3. ⏳ Testar envio de emails
4. ⏳ Implementar rate limiting
5. ⏳ Adicionar templates de email personalizados
6. ⏳ Implementar confirmação de email no signup

## Suporte

Para problemas com envio de emails:
1. Verifique logs do servidor
2. Teste credenciais SMTP manualmente
3. Consulte documentação do provedor
4. Verifique firewall/portas bloqueadas

