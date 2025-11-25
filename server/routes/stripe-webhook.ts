/**
 * Stripe Webhook Handler
 * 
 * Processa eventos do Stripe (assinaturas, pagamentos, cancelamentos)
 */

import { Router, Request, Response } from 'express';
import { stripe } from '../stripe';
import type Stripe from 'stripe';
import { ENV } from '../_core/env';
import { 
  updateUserSubscription, 
  addExtraRenders,
  getUserByStripeCustomerId,
  resetMonthlyQuota
} from '../db';
import { getPlanFromPriceId, getPlanConfig } from '../config/stripe-products';
import {
  sendWelcomeEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
} from '../email/emailService';

const router = Router();

const webhookSecret = ENV.stripeWebhookSecret || '';

/**
 * POST /api/stripe/webhook
 * Endpoint para receber eventos do Stripe
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    if (!stripe) {
      return res.status(500).send('Stripe not configured');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing event:`, error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Processa checkout.session.completed
 * Ativado quando usuário completa pagamento
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.metadata?.userId || '0');
  if (!userId) {
    console.error('[Stripe Webhook] No userId in session metadata');
    return;
  }

  // Se for compra de pacote extra
  if (session.metadata?.type === 'extra_renders') {
    const quantity = parseInt(session.metadata?.quantity || '1');
    const rendersToAdd = 20 * quantity; // 20 renders por pacote

    await addExtraRenders(userId, rendersToAdd);
    console.log(`[Stripe Webhook] Added ${rendersToAdd} extra renders to user ${userId}`);
    return;
  }

  // Se for assinatura, será processado no evento subscription.created
  console.log(`[Stripe Webhook] Checkout completed for user ${userId}`);
}

/**
 * Processa customer.subscription.created e customer.subscription.updated
 * Ativado quando assinatura é criada ou atualizada
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error(`[Stripe Webhook] User not found for customer ${customerId}`);
    return;
  }

  // Obter Price ID da assinatura
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.error('[Stripe Webhook] No price ID in subscription');
    return;
  }

  // Determinar plano e quota
  const plan = getPlanFromPriceId(priceId);
  const planConfig = getPlanConfig(plan);

  // Mapear status do Stripe para nosso schema
  let status: 'active' | 'canceled' | 'past_due' | 'inactive' = 'inactive';
  if (subscription.status === 'active') status = 'active';
  else if (subscription.status === 'canceled') status = 'canceled';
  else if (subscription.status === 'past_due') status = 'past_due';

  // Atualizar usuário
  await updateUserSubscription({
    userId: user.id,
    subscriptionId: subscription.id,
    subscriptionStatus: status,
    plan,
    monthlyQuota: (planConfig as any).features?.monthlyQuota || 0,
  });

  console.log(`[Stripe Webhook] Updated subscription for user ${user.id}: ${plan} (${status})`);

  // Enviar email de boas-vindas se for nova assinatura ativa
  if (status === 'active' && user.email) {
    const billingPeriodEnd = (subscription as any).current_period_end 
      ? new Date((subscription as any).current_period_end * 1000).toLocaleDateString('pt-BR')
      : 'N/A';
    
    const planName = plan === 'basic' ? 'Basic' : 'Pro';
    const planValue = plan === 'basic' ? '99,90' : '149,90';

    await sendWelcomeEmail({
      to: user.email,
      nome: user.name || 'Usuário',
      plano: planName,
      quota: (planConfig as any).features?.monthlyQuota || 0,
      proximaCobranca: billingPeriodEnd,
      valor: planValue,
    });
    console.log(`[Stripe Webhook] Welcome email sent to ${user.email}`);
  }
}

/**
 * Processa customer.subscription.deleted
 * Ativado quando assinatura é cancelada/expirada
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error(`[Stripe Webhook] User not found for customer ${customerId}`);
    return;
  }

  // Reverter para plano free
  await updateUserSubscription({
    userId: user.id,
    subscriptionId: undefined,
    subscriptionStatus: 'inactive',
    plan: 'free',
    monthlyQuota: 0,
  });

  console.log(`[Stripe Webhook] Subscription deleted for user ${user.id}, reverted to free plan`);
}

/**
 * Processa invoice.payment_succeeded
 * Ativado quando pagamento é bem-sucedido (renovação mensal)
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error(`[Stripe Webhook] User not found for customer ${customerId}`);
    return;
  }

  // Se for renovação de assinatura, resetar quota mensal
  if ((invoice as any).subscription && user.email) {
    await resetMonthlyQuota(user.id);
    console.log(`[Stripe Webhook] Monthly quota reset for user ${user.id}`);

    // Enviar email de confirmação de pagamento
    const planName = user.plan === 'basic' ? 'Basic' : 'Pro';
    const planValue = user.plan === 'basic' ? '99,90' : '149,90';
    const paymentDate = new Date((invoice as any).created * 1000).toLocaleDateString('pt-BR');
    const nextBilling = (invoice as any).period_end 
      ? new Date((invoice as any).period_end * 1000).toLocaleDateString('pt-BR')
      : 'N/A';
    
    const lastFour = (invoice as any).charge?.payment_method_details?.card?.last4 || '****';

    await sendPaymentSuccessEmail({
      to: user.email,
      nome: user.name || 'Usuário',
      plano: planName,
      valor: planValue,
      data: paymentDate,
      metodoPagamento: `Cartão final ${lastFour}`,
      proximaCobranca: nextBilling,
      quota: user.monthlyQuota || 0,
      extras: user.extraRenders || 0,
      linkRecibo: (invoice as any).hosted_invoice_url,
    });
    console.log(`[Stripe Webhook] Payment success email sent to ${user.email}`);
  }
}

/**
 * Processa invoice.payment_failed
 * Ativado quando pagamento falha
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error(`[Stripe Webhook] User not found for customer ${customerId}`);
    return;
  }

  // Atualizar status para past_due
  await updateUserSubscription({
    userId: user.id,
    subscriptionStatus: 'past_due',
  });

  console.log(`[Stripe Webhook] Payment failed for user ${user.id}, status set to past_due`);

  // Enviar email de falha no pagamento
  if (user.email) {
    const planName = user.plan === 'basic' ? 'Basic' : 'Pro';
    const planValue = user.plan === 'basic' ? '99,90' : '149,90';
    const failureDate = new Date((invoice as any).created * 1000).toLocaleDateString('pt-BR');
    const failureReason = (invoice as any).last_finalization_error?.message || 'Cartão recusado';

    await sendPaymentFailedEmail({
      to: user.email,
      nome: user.name || 'Usuário',
      plano: planName,
      valor: planValue,
      data: failureDate,
      motivo: failureReason,
    });
    console.log(`[Stripe Webhook] Payment failed email sent to ${user.email}`);
  }
}

export default router;

