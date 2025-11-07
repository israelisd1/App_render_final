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
  const emailHost = process.env.EMAIL_HOST?.trim();
  const emailPort = process.env.EMAIL_PORT?.trim();
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = process.env.EMAIL_PASSWORD?.trim();
  const emailFrom = process.env.EMAIL_FROM?.trim() || emailUser;

  // Se não houver configuração de email, usar modo de desenvolvimento (console)
  if (!emailHost || !emailUser || !emailPassword) {
    console.log("[Email] SMTP não configurado. Usando modo de desenvolvimento (console only).");
    return null;
  }

  return nodemailer.createTransport({
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #d97706; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Redefinir Senha</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 15px 0;">Olá,</p>
              <p style="margin: 0 0 15px 0;">Você solicitou a redefinição de senha para sua conta no <strong>Architecture Rendering App</strong>.</p>
              <p style="margin: 0 0 20px 0;">Clique no botão abaixo para criar uma nova senha:</p>
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #d97706; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Redefinir Senha</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 10px 0;">Ou copie e cole este link no seu navegador:</p>
              <p style="margin: 0 0 20px 0; background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">${resetUrl}</p>
              <!-- Warning Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px;">
                    <p style="margin: 0 0 10px 0;"><strong>⚠️ Importante:</strong></p>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>Este link expira em <strong>1 hora</strong></li>
                      <li>Se você não solicitou esta redefinição, ignore este email</li>
                      <li>Nunca compartilhe este link com outras pessoas</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0 0 5px 0;">Este é um email automático. Por favor, não responda.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Architecture Rendering App</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

