/**
 * Endpoint de teste para envio de emails
 * REMOVER EM PRODUÇÃO
 */

import { Router, Request, Response } from 'express';
import {
  sendWelcomeEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendQuotaAlertEmail,
  sendSubscriptionCanceledEmail,
} from '../email/emailService';

const router = Router();

/**
 * POST /api/test-email/:type
 * Envia email de teste
 */
router.post('/test-email/:type', async (req: Request, res: Response) => {
  const { type } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    let success = false;

    switch (type) {
      case 'welcome':
        success = await sendWelcomeEmail({
          to: email,
          nome: 'Israel Dias',
          plano: 'Basic',
          quota: 50,
          proximaCobranca: '10/12/2025',
          valor: '99,90',
        });
        break;

      case 'payment-success':
        success = await sendPaymentSuccessEmail({
          to: email,
          nome: 'Israel Dias',
          plano: 'Basic',
          valor: '99,90',
          data: new Date().toLocaleDateString('pt-BR'),
          metodoPagamento: 'Cartão final 1234',
          proximaCobranca: '10/12/2025',
          quota: 50,
          extras: 5,
          linkRecibo: 'https://invoice.stripe.com/example',
        });
        break;

      case 'payment-failed':
        success = await sendPaymentFailedEmail({
          to: email,
          nome: 'Israel Dias',
          plano: 'Basic',
          valor: '99,90',
          data: new Date().toLocaleDateString('pt-BR'),
          motivo: 'Cartão recusado - saldo insuficiente',
        });
        break;

      case 'quota-alert':
        success = await sendQuotaAlertEmail({
          to: email,
          nome: 'Israel Dias',
          plano: 'Basic',
          quota: 50,
          utilizadas: 46,
          porcentagem: 92,
          restantes: 4,
          diasRestantes: 15,
          dataRenovacao: '25/11/2025',
        });
        break;

      case 'subscription-canceled':
        success = await sendSubscriptionCanceledEmail({
          to: email,
          nome: 'Israel Dias',
          plano: 'Basic',
          dataFim: '30/11/2025',
          restantes: 25,
          extras: 10,
        });
        break;

      default:
        return res.status(400).json({ 
          error: 'Tipo inválido. Use: welcome, payment-success, payment-failed, quota-alert, subscription-canceled' 
        });
    }

    if (success) {
      res.json({ 
        success: true, 
        message: `Email de ${type} enviado para ${email}`,
        type,
        email,
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Falha ao enviar email. Verifique logs do servidor.' 
      });
    }
  } catch (error: any) {
    console.error('[Test Email] Erro:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro desconhecido' 
    });
  }
});

/**
 * GET /api/test-email/all/:email
 * Envia todos os 5 tipos de email de uma vez
 */
router.get('/test-email/all/:email', async (req: Request, res: Response) => {
  const { email } = req.params;

  const results = [];

  try {
    // 1. Boas-vindas
    const welcome = await sendWelcomeEmail({
      to: email,
      nome: 'Israel Dias',
      plano: 'Basic',
      quota: 50,
      proximaCobranca: '10/12/2025',
      valor: '99,90',
    });
    results.push({ type: 'welcome', success: welcome });

    // Aguardar 2 segundos entre emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Pagamento bem-sucedido
    const paymentSuccess = await sendPaymentSuccessEmail({
      to: email,
      nome: 'Israel Dias',
      plano: 'Basic',
      valor: '99,90',
      data: new Date().toLocaleDateString('pt-BR'),
      metodoPagamento: 'Cartão final 1234',
      proximaCobranca: '10/12/2025',
      quota: 50,
      extras: 5,
      linkRecibo: 'https://invoice.stripe.com/example',
    });
    results.push({ type: 'payment-success', success: paymentSuccess });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Falha no pagamento
    const paymentFailed = await sendPaymentFailedEmail({
      to: email,
      nome: 'Israel Dias',
      plano: 'Basic',
      valor: '99,90',
      data: new Date().toLocaleDateString('pt-BR'),
      motivo: 'Cartão recusado - saldo insuficiente',
    });
    results.push({ type: 'payment-failed', success: paymentFailed });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Alerta de quota
    const quotaAlert = await sendQuotaAlertEmail({
      to: email,
      nome: 'Israel Dias',
      plano: 'Basic',
      quota: 50,
      utilizadas: 46,
      porcentagem: 92,
      restantes: 4,
      diasRestantes: 15,
      dataRenovacao: '25/11/2025',
    });
    results.push({ type: 'quota-alert', success: quotaAlert });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Cancelamento
    const canceled = await sendSubscriptionCanceledEmail({
      to: email,
      nome: 'Israel Dias',
      plano: 'Basic',
      dataFim: '30/11/2025',
      restantes: 25,
      extras: 10,
    });
    results.push({ type: 'subscription-canceled', success: canceled });

    const allSuccess = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    res.json({
      success: allSuccess,
      message: `${successCount}/5 emails enviados com sucesso para ${email}`,
      email,
      results,
    });
  } catch (error: any) {
    console.error('[Test Email All] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro desconhecido',
      results,
    });
  }
});

export default router;
