/**
 * Rotas de Assinatura - Stripe Integration
 * 
 * Gerencia criação, cancelamento e compra de pacotes extras
 */

import { Router, Request, Response } from 'express';
import { stripe } from '../stripe';
import { 
  getUserById, 
  updateUserSubscription, 
  addExtraRenders,
  getUserByStripeCustomerId 
} from '../db';
import { STRIPE_PRODUCTS, getPlanFromPriceId, getPlanConfig } from '../config/stripe-products';

const router = Router();

/**
 * POST /api/subscription/create-checkout
 * Cria sessão de checkout do Stripe para assinatura
 */
router.post('/create-checkout', async (req: Request, res: Response) => {
  try {
    const { userId, priceId } = req.body;

    if (!userId || !priceId) {
      return res.status(400).json({ error: 'userId and priceId are required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determinar o plano baseado no priceId
    const plan = getPlanFromPriceId(priceId);
    if (plan === 'free') {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    // Criar ou recuperar Stripe Customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: userId.toString(),
        },
      });
      customerId = customer.id;

      // Salvar customer ID no banco
      await updateUserSubscription({
        userId,
        stripeCustomerId: customerId,
      });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription/canceled`,
      metadata: {
        userId: userId.toString(),
        plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[Subscription] Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancela assinatura no final do período de cobrança
 */
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancelar assinatura no Stripe (no final do período)
    const subscription = await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: true,
    });

    // Atualizar status no banco
    await updateUserSubscription({
      userId,
      subscriptionStatus: 'canceled',
    });

    res.json({ 
      success: true, 
      message: 'Subscription will be canceled at the end of the billing period',
      periodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('[Subscription] Cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/subscription/reactivate
 * Reativa assinatura cancelada (antes do final do período)
 */
router.post('/reactivate', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscriptionId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    // Reativar assinatura no Stripe
    await stripe.subscriptions.update(user.subscriptionId, {
      cancel_at_period_end: false,
    });

    // Atualizar status no banco
    await updateUserSubscription({
      userId,
      subscriptionStatus: 'active',
    });

    res.json({ success: true, message: 'Subscription reactivated' });
  } catch (error) {
    console.error('[Subscription] Reactivate error:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

/**
 * POST /api/subscription/buy-extra
 * Compra pacote extra de renderizações
 */
router.post('/buy-extra', async (req: Request, res: Response) => {
  try {
    const { userId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Criar ou recuperar Stripe Customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: userId.toString(),
        },
      });
      customerId = customer.id;

      await updateUserSubscription({
        userId,
        stripeCustomerId: customerId,
      });
    }

    // Criar sessão de checkout para pagamento único
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRODUCTS.EXTRA.priceId,
          quantity,
        },
      ],
      success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription/extra-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription/canceled`,
      metadata: {
        userId: userId.toString(),
        type: 'extra_renders',
        quantity: quantity.toString(),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[Subscription] Buy extra error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /api/subscription/status
 * Retorna status da assinatura do usuário
 */
router.get('/status/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const planConfig = getPlanConfig(user.plan);

    res.json({
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      monthlyQuota: user.monthlyQuota,
      monthlyRendersUsed: user.monthlyRendersUsed,
      extraRenders: user.extraRenders,
      totalAvailable: (user.monthlyQuota - user.monthlyRendersUsed) + user.extraRenders,
      billingPeriodStart: user.billingPeriodStart,
      billingPeriodEnd: user.billingPeriodEnd,
      features: planConfig.features || {},
    });
  } catch (error) {
    console.error('[Subscription] Status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

/**
 * GET /api/subscription/portal
 * Cria sessão do Customer Portal do Stripe
 */
router.post('/portal', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await getUserById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'No Stripe customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('[Subscription] Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;

