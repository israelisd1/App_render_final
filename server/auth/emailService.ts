/**
 * Serviço de Envio de Emails
 * Suporta SMTP configurável via variáveis de ambiente
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Criar transporter do Nodemailer
 */
function createTransporter() {
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  // Se não houver configuração de email, usar modo de desenvolvimento (console)
  if (!emailHost || !emailUser || !emailPassword) {
    console.log("[Email] SMTP não configurado. Usando modo de desenvolvimento (console only).");
    return null;
  }

  return nodemailer.createTransporter({
    host: emailHost,
    port: parseInt(emailPort || "587"),
    secure: emailPort === "465", // true para porta 465, false para outras
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

/**
 * Enviar email de reset de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<boolean> {
  const transporter = createTransporter();

  const subject = "Redefinir Senha - Architecture Rendering App";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Redefinir Senha</h1>
        </div>
        <div class="content">
          <p>Olá,</p>
          <p>Você solicitou a redefinição de senha para sua conta no <strong>Architecture Rendering App</strong>.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </p>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${resetUrl}
          </p>
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este link expira em <strong>1 hora</strong></li>
              <li>Se você não solicitou esta redefinição, ignore este email</li>
              <li>Nunca compartilhe este link com outras pessoas</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Este é um email automático. Por favor, não responda.</p>
          <p>&copy; ${new Date().getFullYear()} Architecture Rendering App</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Redefinir Senha - Architecture Rendering App

Olá,

Você solicitou a redefinição de senha para sua conta no Architecture Rendering App.

Acesse o link abaixo para criar uma nova senha:
${resetUrl}

⚠️ Importante:
- Este link expira em 1 hora
- Se você não solicitou esta redefinição, ignore este email
- Nunca compartilhe este link com outras pessoas

Este é um email automático. Por favor, não responda.
© ${new Date().getFullYear()} Architecture Rendering App
  `;

  // Se não houver transporter (modo desenvolvimento), apenas logar
  if (!transporter) {
    console.log("\n" + "=".repeat(80));
    console.log("[Email] MODO DESENVOLVIMENTO - Email não enviado");
    console.log("=".repeat(80));
    console.log(`Para: ${email}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Link de Reset: ${resetUrl}`);
    console.log(`Token: ${resetToken}`);
    console.log("=".repeat(80) + "\n");
    return true;
  }

  // Enviar email real
  try {
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `"Architecture Rendering App" <${emailFrom}>`,
      to: email,
      subject,
      text,
      html,
    });

    console.log(`[Email] Email de reset enviado para: ${email}`);
    return true;
  } catch (error: any) {
    console.error("[Email] Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Enviar email genérico
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("\n" + "=".repeat(80));
    console.log("[Email] MODO DESENVOLVIMENTO - Email não enviado");
    console.log("=".repeat(80));
    console.log(`Para: ${options.to}`);
    console.log(`Assunto: ${options.subject}`);
    console.log(`Conteúdo: ${options.text || "Ver HTML"}`);
    console.log("=".repeat(80) + "\n");
    return true;
  }

  try {
    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `"Architecture Rendering App" <${emailFrom}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`[Email] Email enviado para: ${options.to}`);
    return true;
  } catch (error: any) {
    console.error("[Email] Erro ao enviar email:", error);
    return false;
  }
}

