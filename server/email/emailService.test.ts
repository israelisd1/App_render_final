import { describe, it, expect } from 'vitest';
import {
  welcomeEmail,
  paymentSuccessEmail,
  paymentFailedEmail,
  quotaAlertEmail,
  subscriptionCanceledEmail,
} from './templates';

describe('Email Templates', () => {
  it('deve gerar email de boas-vindas com dados corretos', () => {
    const html = welcomeEmail({
      nome: 'João Silva',
      plano: 'Basic',
      quota: 50,
      proximaCobranca: '10/12/2025',
      valor: '99,90',
    });

    expect(html).toContain('João Silva');
    expect(html).toContain('Basic');
    expect(html).toContain('50 renderizações');
    expect(html).toContain('10/12/2025');
    expect(html).toContain('R$ 99,90/mês');
    expect(html).toContain('Bem-vindo ao Arqrender');
  });

  it('deve gerar email de pagamento bem-sucedido', () => {
    const html = paymentSuccessEmail({
      nome: 'Maria Santos',
      plano: 'Pro',
      valor: '149,90',
      data: '01/11/2025',
      metodoPagamento: 'Cartão final 1234',
      proximaCobranca: '01/12/2025',
      quota: 100,
      extras: 5,
    });

    expect(html).toContain('Maria Santos');
    expect(html).toContain('Pro');
    expect(html).toContain('R$ 149,90');
    expect(html).toContain('01/11/2025');
    expect(html).toContain('Cartão final 1234');
    expect(html).toContain('Pagamento Confirmado');
  });

  it('deve gerar email de falha no pagamento', () => {
    const html = paymentFailedEmail({
      nome: 'Pedro Costa',
      plano: 'Basic',
      valor: '99,90',
      data: '05/11/2025',
      motivo: 'Cartão recusado',
    });

    expect(html).toContain('Pedro Costa');
    expect(html).toContain('Basic');
    expect(html).toContain('R$ 99,90');
    expect(html).toContain('Cartão recusado');
    expect(html).toContain('Ação Necessária');
  });

  it('deve gerar email de alerta de quota', () => {
    const html = quotaAlertEmail({
      nome: 'Ana Lima',
      plano: 'Basic',
      quota: 50,
      utilizadas: 46,
      porcentagem: 92,
      restantes: 4,
      diasRestantes: 15,
      dataRenovacao: '25/11/2025',
    });

    expect(html).toContain('Ana Lima');
    expect(html).toContain('50 renderizações');
    expect(html).toContain('46');
    expect(html).toContain('92%');
    expect(html).toContain('4');
    expect(html).toContain('15 dias');
    expect(html).toContain('Quota Está Quase Acabando');
  });

  it('deve gerar email de assinatura cancelada', () => {
    const html = subscriptionCanceledEmail({
      nome: 'Carlos Souza',
      plano: 'Pro',
      dataFim: '30/11/2025',
      restantes: 25,
      extras: 10,
    });

    expect(html).toContain('Carlos Souza');
    expect(html).toContain('Pro');
    expect(html).toContain('30/11/2025');
    expect(html).toContain('25');
    expect(html).toContain('10');
    expect(html).toContain('Confirmação de Cancelamento');
  });

  it('todos os templates devem incluir logo e footer', () => {
    const templates = [
      welcomeEmail({
        nome: 'Test',
        plano: 'Basic',
        quota: 50,
        proximaCobranca: '01/01/2026',
        valor: '99,90',
      }),
      paymentSuccessEmail({
        nome: 'Test',
        plano: 'Basic',
        valor: '99,90',
        data: '01/01/2026',
        metodoPagamento: 'Cartão',
        proximaCobranca: '01/02/2026',
        quota: 50,
        extras: 0,
      }),
      paymentFailedEmail({
        nome: 'Test',
        plano: 'Basic',
        valor: '99,90',
        data: '01/01/2026',
        motivo: 'Teste',
      }),
      quotaAlertEmail({
        nome: 'Test',
        plano: 'Basic',
        quota: 50,
        utilizadas: 46,
        porcentagem: 92,
        restantes: 4,
        diasRestantes: 15,
        dataRenovacao: '01/01/2026',
      }),
      subscriptionCanceledEmail({
        nome: 'Test',
        plano: 'Basic',
        dataFim: '01/01/2026',
        restantes: 10,
        extras: 5,
      }),
    ];

    templates.forEach((html) => {
      expect(html).toContain('Arqrender');
      expect(html).toContain('Acessar Plataforma');
      expect(html).toContain('Gerenciar Assinatura');
      expect(html).toContain('<!DOCTYPE html>');
    });
  });
});
