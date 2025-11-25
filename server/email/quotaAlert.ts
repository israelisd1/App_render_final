import { sendQuotaAlertEmail } from './emailService';

/**
 * Verifica se deve enviar alerta de quota (90%) e envia email
 */
export async function checkAndSendQuotaAlert(user: {
  id: number;
  email: string | null;
  name: string | null;
  plan: string;
  monthlyQuota: number;
  monthlyRendersUsed: number;
  billingPeriodEnd: Date | null;
}): Promise<void> {
  // Só envia alerta para usuários com plano pago
  if (user.plan === 'free' || !user.email) {
    return;
  }

  // Calcular porcentagem de uso
  const quota = user.monthlyQuota || 0;
  const used = user.monthlyRendersUsed || 0;
  
  if (quota === 0) {
    return;
  }

  const percentage = (used / quota) * 100;

  // Enviar alerta apenas se atingiu 90% ou mais
  if (percentage >= 90) {
    const remaining = quota - used;
    const daysRemaining = user.billingPeriodEnd 
      ? Math.ceil((user.billingPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const renewalDate = user.billingPeriodEnd
      ? user.billingPeriodEnd.toLocaleDateString('pt-BR')
      : 'N/A';

    const planName = user.plan === 'basic' ? 'Basic' : 'Pro';

    await sendQuotaAlertEmail({
      to: user.email,
      nome: user.name || 'Usuário',
      plano: planName,
      quota,
      utilizadas: used,
      porcentagem: Math.round(percentage),
      restantes: remaining,
      diasRestantes: daysRemaining,
      dataRenovacao: renewalDate,
    });

    console.log(`[Email] Quota alert sent to user ${user.id} (${percentage.toFixed(1)}% used)`);
  }
}
