import nodemailer from 'nodemailer';
import { ENV } from '../_core/env';
import {
  welcomeEmail,
  paymentSuccessEmail,
  paymentFailedEmail,
  quotaAlertEmail,
  subscriptionCanceledEmail,
} from './templates';

// Criar transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: ENV.emailHost,
  port: parseInt(ENV.emailPort),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: ENV.emailUser,
    pass: ENV.emailPassword,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: ENV.emailFrom,
      to,
      subject,
      html,
    });
    console.log(`[Email] Enviado para ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error(`[Email] Erro ao enviar para ${to}:`, error);
    return false;
  }
}

// ============================================
// EMAILS DE ASSINATURA
// ============================================

export async function sendWelcomeEmail(params: {
  to: string;
  nome: string;
  plano: string;
  quota: number;
  proximaCobranca: string;
  valor: string;
}): Promise<boolean> {
  const html = welcomeEmail({
    nome: params.nome,
    plano: params.plano,
    quota: params.quota,
    proximaCobranca: params.proximaCobranca,
    valor: params.valor,
  });

  return sendEmail({
    to: params.to,
    subject: `Bem-vindo ao Arqrender ${params.plano}! Sua assinatura está ativa`,
    html,
  });
}

export async function sendPaymentSuccessEmail(params: {
  to: string;
  nome: string;
  plano: string;
  valor: string;
  data: string;
  metodoPagamento: string;
  proximaCobranca: string;
  quota: number;
  extras: number;
  linkRecibo?: string;
}): Promise<boolean> {
  const html = paymentSuccessEmail(params);

  return sendEmail({
    to: params.to,
    subject: `Pagamento confirmado - Arqrender ${params.plano}`,
    html,
  });
}

export async function sendPaymentFailedEmail(params: {
  to: string;
  nome: string;
  plano: string;
  valor: string;
  data: string;
  motivo: string;
}): Promise<boolean> {
  const html = paymentFailedEmail(params);

  return sendEmail({
    to: params.to,
    subject: 'Ação necessária: Falha no pagamento - Arqrender',
    html,
  });
}

export async function sendQuotaAlertEmail(params: {
  to: string;
  nome: string;
  plano: string;
  quota: number;
  utilizadas: number;
  porcentagem: number;
  restantes: number;
  diasRestantes: number;
  dataRenovacao: string;
}): Promise<boolean> {
  const html = quotaAlertEmail(params);

  return sendEmail({
    to: params.to,
    subject: 'Sua quota mensal está quase acabando - Arqrender',
    html,
  });
}

export async function sendSubscriptionCanceledEmail(params: {
  to: string;
  nome: string;
  plano: string;
  dataFim: string;
  restantes: number;
  extras: number;
}): Promise<boolean> {
  const html = subscriptionCanceledEmail(params);

  return sendEmail({
    to: params.to,
    subject: 'Confirmação de cancelamento - Arqrender',
    html,
  });
}
