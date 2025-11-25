/**
 * Template base HTML para emails
 */

export function emailBase(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arqrender</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f4;
      color: #292524;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .content h1 {
      color: #292524;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #57534e;
    }
    .details-box {
      background-color: #fef3c7;
      border-left: 4px solid #ea580c;
      padding: 20px;
      margin: 24px 0;
    }
    .details-box strong {
      color: #292524;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: #ea580c;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #c2410c;
    }
    .footer {
      background-color: #fafaf9;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e7e5e4;
    }
    .footer p {
      margin: 8px 0;
      font-size: 14px;
      color: #78716c;
    }
    .footer a {
      color: #ea580c;
      text-decoration: none;
    }
    .alert {
      background-color: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 16px;
      margin: 20px 0;
    }
    .success {
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 16px;
      margin: 20px 0;
    }
    .warning {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏗️ Arqrender</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>Arqrender</strong> - Renderização Arquitetônica Avançada</p>
      <p>
        <a href="https://archrender-mjzsrrst.manus.space">Acessar Plataforma</a> •
        <a href="https://archrender-mjzsrrst.manus.space/subscription">Gerenciar Assinatura</a> •
        <a href="https://archrender-mjzsrrst.manus.space/pricing">Ver Planos</a>
      </p>
      <p style="font-size: 12px; color: #a8a29e; margin-top: 20px;">
        Você está recebendo este email porque possui uma conta no Arqrender.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
