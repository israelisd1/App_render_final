import { emailBase } from './base';

interface WelcomeEmailData {
  nome: string;
  plano: string;
  quota: number;
  proximaCobranca: string;
  valor: string;
}

export function welcomeEmail(data: WelcomeEmailData): string {
  const content = `
    <h1>🎉 Bem-vindo ao Arqrender ${data.plano}!</h1>
    <p>Olá <strong>${data.nome}</strong>,</p>
    <p>Sua assinatura do plano <strong>${data.plano}</strong> foi ativada com sucesso! Estamos muito felizes em tê-lo conosco.</p>
    
    <div class="details-box">
      <strong>Detalhes da sua assinatura:</strong><br><br>
      <strong>Plano:</strong> ${data.plano}<br>
      <strong>Quota mensal:</strong> ${data.quota} renderizações<br>
      <strong>Próxima cobrança:</strong> ${data.proximaCobranca}<br>
      <strong>Valor:</strong> R$ ${data.valor}/mês
    </div>

    <p><strong>O que você pode fazer agora:</strong></p>
    <ul>
      <li>Acesse sua conta e comece a renderizar seus projetos</li>
      <li>Explore as funcionalidades do seu plano</li>
      <li>Gerencie sua assinatura a qualquer momento</li>
    </ul>

    <a href="https://archrender-mjzsrrst.manus.space" class="button">Começar a Renderizar</a>

    <p>Se tiver alguma dúvida ou precisar de ajuda, estamos à disposição!</p>
    <p>Boas renderizações,<br><strong>Equipe Arqrender</strong></p>
  `;
  return emailBase(content);
}

interface PaymentSuccessEmailData {
  nome: string;
  plano: string;
  valor: string;
  data: string;
  metodoPagamento: string;
  proximaCobranca: string;
  quota: number;
  extras: number;
  linkRecibo?: string;
}

export function paymentSuccessEmail(data: PaymentSuccessEmailData): string {
  const content = `
    <h1>✅ Pagamento Confirmado</h1>
    <p>Olá <strong>${data.nome}</strong>,</p>
    <p>Seu pagamento foi processado com sucesso! Sua assinatura do plano <strong>${data.plano}</strong> foi renovada.</p>
    
    <div class="success">
      <strong>Detalhes do pagamento:</strong><br><br>
      <strong>Valor:</strong> R$ ${data.valor}<br>
      <strong>Data:</strong> ${data.data}<br>
      <strong>Método:</strong> ${data.metodoPagamento}<br>
      <strong>Próxima cobrança:</strong> ${data.proximaCobranca}
    </div>

    <div class="details-box">
      <strong>Sua quota mensal foi resetada:</strong><br><br>
      <strong>Quota disponível:</strong> ${data.quota} renderizações<br>
      <strong>Renderizações extras acumuladas:</strong> ${data.extras}
    </div>

    ${data.linkRecibo ? `<a href="${data.linkRecibo}" class="button">Ver Recibo Completo</a>` : ''}

    <p>Continue criando renderizações incríveis!</p>
    <p><strong>Equipe Arqrender</strong></p>
  `;
  return emailBase(content);
}

interface PaymentFailedEmailData {
  nome: string;
  plano: string;
  valor: string;
  data: string;
  motivo: string;
}

export function paymentFailedEmail(data: PaymentFailedEmailData): string {
  const content = `
    <h1>❌ Ação Necessária: Falha no Pagamento</h1>
    <p>Olá <strong>${data.nome}</strong>,</p>
    <p>Infelizmente, não conseguimos processar o pagamento da sua assinatura do plano <strong>${data.plano}</strong>.</p>
    
    <div class="alert">
      <strong>Detalhes:</strong><br><br>
      <strong>Valor:</strong> R$ ${data.valor}<br>
      <strong>Data da tentativa:</strong> ${data.data}<br>
      <strong>Motivo:</strong> ${data.motivo}
    </div>

    <p><strong>O que fazer agora:</strong></p>
    <p>Sua assinatura continuará ativa por mais alguns dias enquanto tentamos processar o pagamento novamente. Para evitar a interrupção do serviço, por favor:</p>
    
    <ol>
      <li>Acesse a página de gerenciamento de assinatura</li>
      <li>Clique em "Gerenciar" para atualizar seu método de pagamento</li>
      <li>Ou entre em contato conosco se precisar de ajuda</li>
    </ol>

    <a href="https://archrender-mjzsrrst.manus.space/subscription" class="button">Atualizar Pagamento</a>

    <div class="warning">
      <strong>Importante:</strong> Se o pagamento não for regularizado em até 7 dias, sua assinatura será cancelada automaticamente e você voltará para o plano gratuito.
    </div>

    <p>Estamos aqui para ajudar!</p>
    <p><strong>Equipe Arqrender</strong></p>
  `;
  return emailBase(content);
}

interface QuotaAlertEmailData {
  nome: string;
  plano: string;
  quota: number;
  utilizadas: number;
  porcentagem: number;
  restantes: number;
  diasRestantes: number;
  dataRenovacao: string;
}

export function quotaAlertEmail(data: QuotaAlertEmailData): string {
  const content = `
    <h1>⚠️ Sua Quota Está Quase Acabando</h1>
    <p>Olá <strong>${data.nome}</strong>,</p>
    <p>Você está usando sua quota de renderizações com sucesso! 🎉</p>
    
    <div class="warning">
      <strong>Status atual:</strong><br><br>
      <strong>Plano:</strong> ${data.plano}<br>
      <strong>Quota mensal:</strong> ${data.quota} renderizações<br>
      <strong>Já utilizadas:</strong> ${data.utilizadas} (${data.porcentagem}%)<br>
      <strong>Restantes:</strong> ${data.restantes}
    </div>

    <p><strong>Próximas opções:</strong></p>

    <p><strong>Opção 1: Aguardar renovação</strong><br>
    Sua quota será resetada automaticamente em ${data.diasRestantes} dias (${data.dataRenovacao}).</p>

    <p><strong>Opção 2: Comprar pacote extra</strong><br>
    Adicione 20 renderizações por R$ 49,90 (não expira).</p>

    <a href="https://archrender-mjzsrrst.manus.space/pricing" class="button">Ver Opções</a>

    ${data.plano === 'Basic' ? `
    <p><strong>Opção 3: Fazer upgrade</strong><br>
    Mude para o plano Pro e ganhe mais renderizações + qualidade MAX!</p>
    ` : ''}

    <p>Continue criando!</p>
    <p><strong>Equipe Arqrender</strong></p>
  `;
  return emailBase(content);
}

interface SubscriptionCanceledEmailData {
  nome: string;
  plano: string;
  dataFim: string;
  restantes: number;
  extras: number;
}

export function subscriptionCanceledEmail(data: SubscriptionCanceledEmailData): string {
  const content = `
    <h1>🔔 Confirmação de Cancelamento</h1>
    <p>Olá <strong>${data.nome}</strong>,</p>
    <p>Confirmamos o cancelamento da sua assinatura do plano <strong>${data.plano}</strong>.</p>
    
    <div class="details-box">
      <strong>Detalhes:</strong><br><br>
      <strong>Sua assinatura permanecerá ativa até:</strong> ${data.dataFim}<br>
      <strong>Renderizações restantes:</strong> ${data.restantes}<br>
      <strong>Não haverá mais cobranças automáticas</strong>
    </div>

    <p><strong>Após ${data.dataFim}:</strong></p>
    <ul>
      <li>Você voltará para o plano gratuito</li>
      <li>Suas renderizações extras (${data.extras}) serão mantidas</li>
      <li>Você poderá reativar sua assinatura a qualquer momento</li>
    </ul>

    <div class="warning">
      <strong>Mudou de ideia?</strong><br>
      Você pode reativar sua assinatura antes de ${data.dataFim}.
    </div>

    <a href="https://archrender-mjzsrrst.manus.space/subscription" class="button">Reativar Assinatura</a>

    <p>Sentiremos sua falta! Se houver algo que possamos melhorar, adoraríamos ouvir seu feedback.</p>
    <p><strong>Equipe Arqrender</strong></p>
  `;
  return emailBase(content);
}
