/**
 * Sistema de Autenticação Customizado
 * Suporta Email/Senha e Google OAuth via Arctic
 */

import { Request, Response, NextFunction, Express } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as db from "../db";
import { validatePhone } from "../utils/validatePhone";
const { checkEmailExists, saveEmailHistory, updateUserProfile, getUserById, updateUserVerificationToken } = db;
import { sendPasswordResetEmail } from "./emailService";

// Lazy loading do Google OAuth para evitar problemas de inicialização
let _google: any = null;
async function getGoogleClient() {
  if (!_google) {
    const { Google } = await import("arctic");
    _google = new Google(
      process.env.GOOGLE_CLIENT_ID || "",
      process.env.GOOGLE_CLIENT_SECRET || "",
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`
    );
  }
  return _google;
}

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-change-me";
const JWT_EXPIRY = "30d"; // 30 dias

/**
 * Gerar token JWT para usuário
 */
export function generateToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verificar e decodificar token JWT
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware de autenticação
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    (req as any).user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    (req as any).user = null;
    return next();
  }

  // Buscar usuário atualizado do banco
  const user = await db.getUserByEmail(decoded.email);
  (req as any).user = user || null;

  next();
}

/**
 * Registrar rotas de autenticação
 */
export function registerCustomAuthRoutes(app: Express) {
  // Rota de signup (Email/Senha)
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name, cpf, phone } = req.body;

      if (!email || !password || !cpf || !phone) {
        return res.status(400).json({ error: "Email, senha, CPF e telefone são obrigatórios" });
      }

      // Validar CPF
      const { validateCPF, cleanCPF } = await import("../utils/validateCPF");
      if (!validateCPF(cpf)) {
        return res.status(400).json({ error: "CPF inválido" });
      }

      const cpfClean = cleanCPF(cpf);

      // Validar telefone
      const { validatePhone, cleanPhone } = await import("../utils/validatePhone");
      if (!validatePhone(phone)) {
        return res.status(400).json({ error: "Telefone inválido. Use o formato (##) #####-####" });
      }

      const phoneClean = cleanPhone(phone);

      // Verificar se email já existe
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      // Verificar se CPF já existe
      const existingCPF = await db.getUserByCPF(cpfClean);
      if (existingCPF) {
        return res.status(400).json({ error: "CPF já cadastrado" });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      await db.createUser({
        email,
        cpf: cpfClean,
        phone: phoneClean,
        name: name || null,
        password: hashedPassword,
        provider: "email",
        emailVerified: 0, // Não verificado inicialmente
      });

      // Buscar usuário criado
      const newUser = await db.getUserByEmail(email);
      if (!newUser) {
        return res.status(500).json({ error: "Erro ao criar usuário" });
      }

      // Gerar token
      const token = generateToken(newUser);

      // Definir cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      });

      res.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          plan: newUser.plan,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Signup error:", error);
      res.status(500).json({ error: error.message || "Erro ao criar conta" });
    }
  });

  // Rota de login (Email/Senha)
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Verificar provider
      if (user.provider !== "email") {
        return res.status(400).json({ error: `Esta conta usa login com ${user.provider}` });
      }

      // Verificar senha
      if (!user.password) {
        return res.status(400).json({ error: "Senha não configurada" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Atualizar último login
      await db.updateUserLastSignIn(user.id);

      // Gerar token
      const token = generateToken(user);

      // Definir cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Signin error:", error);
      res.status(500).json({ error: error.message || "Erro ao fazer login" });
    }
  });

  // Rota de logout
  app.post("/api/auth/signout", (req: Request, res: Response) => {
    res.clearCookie("auth_token");
    res.json({ success: true });
  });

  // Rota de sessão (verificar se está logado)
  app.get("/api/auth/session", async (req: Request, res: Response) => {
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.json({ user: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.clearCookie("auth_token");
      return res.json({ user: null });
    }

    // Buscar usuário atualizado
    const user = await db.getUserByEmail(decoded.email);
    if (!user) {
      res.clearCookie("auth_token");
      return res.json({ user: null });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        extraRenders: user.extraRenders,
        monthlyQuota: user.monthlyQuota,
        monthlyRendersUsed: user.monthlyRendersUsed,
      },
    });
  });

  // Google OAuth - Iniciar fluxo
  app.get("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const state = crypto.randomBytes(32).toString("hex");
      const codeVerifier = crypto.randomBytes(32).toString("hex");

      // Armazenar state e codeVerifier em cookie temporário
      res.cookie("google_oauth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000, // 10 minutos
      });

      res.cookie("google_code_verifier", codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
      });

      const googleClient = await getGoogleClient();
      const url = googleClient.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
      res.redirect(url.toString());
    } catch (error: any) {
      console.error("[Auth] Google OAuth error:", error);
      res.redirect("/login?error=oauth_failed");
    }
  });

  // Google OAuth - Callback
  app.get("/api/auth/callback/google", async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;
      const storedState = req.cookies?.google_oauth_state;
      const codeVerifier = req.cookies?.google_code_verifier;

      if (!code || !state || !storedState || state !== storedState) {
        return res.redirect("/login?error=invalid_state");
      }

      // Trocar code por tokens
      const googleClient = await getGoogleClient();
      const tokens = await googleClient.validateAuthorizationCode(code as string, codeVerifier);

      // Buscar informações do usuário do Google
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokens.accessToken()}` },
      });

      const googleUser: any = await response.json();

      if (!googleUser.email) {
        return res.redirect("/login?error=no_email");
      }

      // Verificar se usuário já existe
      let user = await db.getUserByEmail(googleUser.email);

      if (!user) {
        // Criar novo usuário
        await db.createUser({
          email: googleUser.email,
          name: googleUser.name || null,
          provider: "google",
          emailVerified: 1, // Google já verifica
        });

        user = await db.getUserByEmail(googleUser.email);
      } else {
        // Atualizar último login
        await db.updateUserLastSignIn(user.id);
      }

      if (!user) {
        return res.redirect("/login?error=user_creation_failed");
      }

      // Gerar token
      const token = generateToken(user);

      // Limpar cookies temporários
      res.clearCookie("google_oauth_state");
      res.clearCookie("google_code_verifier");

      // Definir cookie de autenticação
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.redirect("/");
    } catch (error: any) {
      console.error("[Auth] Google callback error:", error);
      res.redirect("/login?error=oauth_callback_failed");
    }
  });

  // Rota de reset de senha (enviar email)
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }

      const user = await db.getUserByEmail(email);
      if (!user) {
        // Não revelar se o email existe ou não (segurança)
        return res.json({ success: true, message: "Se o email existir, você receberá instruções" });
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await db.setResetPasswordToken(user.id, resetToken, expires);

      // Enviar email com link de reset
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
      const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);

      if (!emailSent) {
        console.error(`[Auth] Falha ao enviar email para ${email}`);
      }

      res.json({ success: true, message: "Se o email existir, você receberá instruções" });
    } catch (error: any) {
      console.error("[Auth] Forgot password error:", error);
      res.status(500).json({ error: "Erro ao processar solicitação" });
    }
  });

  // Rota de reset de senha (confirmar nova senha)
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: "Token e senha são obrigatórios" });
      }

      const user = await db.getUserByResetToken(token);
      if (!user || !user.resetPasswordExpires) {
        return res.status(400).json({ error: "Token inválido ou expirado" });
      }

      if (new Date() > user.resetPasswordExpires) {
        return res.status(400).json({ error: "Token expirado" });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Atualizar senha
      await db.updateUserPassword(user.id, hashedPassword);

      res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error: any) {
      console.error("[Auth] Reset password error:", error);
      res.status(500).json({ error: "Erro ao redefinir senha" });
    }
  });

  /**
   * POST /api/auth/send-verification
   * Envia email de verificação
   */
  app.post("/api/auth/send-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email é obrigatório" });
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Se já verificado, retornar sucesso
      if (user.emailVerified === 1) {
        return res.json({ success: true, message: "Email já verificado" });
      }

      // Gerar token de verificação
      const verificationToken = crypto.randomBytes(32).toString("hex");
      
      // Salvar token no banco
      await db.updateUserVerificationToken(user.id, verificationToken);

      // Enviar email
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(user.email!, verificationUrl);

      console.log(`[Auth] Verification email sent to: ${email}`);
      res.json({ success: true, message: "Email de verificação enviado" });
    } catch (error: any) {
      console.error("[Auth] Send verification error:", error);
      res.status(500).json({ error: "Erro ao enviar email de verificação" });
    }
  });

  /**
   * POST /api/auth/verify-email
   * Verifica email com token
   */
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token é obrigatório" });
      }

      // Buscar usuário pelo token
      const user = await db.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: "Token inválido ou expirado" });
      }

      // Marcar email como verificado
      await db.verifyUserEmail(user.id);

      console.log(`[Auth] Email verified for user: ${user.email}`);
      res.json({ success: true, message: "Email verificado com sucesso" });
    } catch (error: any) {
      console.error("[Auth] Verify email error:", error);
      res.status(500).json({ error: "Erro ao verificar email" });
    }
  });

  /**
   * Enviar email de verificação (função auxiliar interna)
   */
  async function sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
  const { sendEmail } = await import('./emailService');
  
  const subject = `Verificar Email - ${process.env.VITE_APP_TITLE || 'Architecture Rendering App'}`;
  
  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <tr>
        <td style="background-color: #f97316; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Verificar Email</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px 30px; background-color: #ffffff;">
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
            Olá!
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px;">
            Por favor, clique no botão abaixo para verificar seu endereço de email e ativar sua conta:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="${verificationUrl}" style="display: inline-block; padding: 15px 40px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                  Verificar Email
                </a>
              </td>
            </tr>
          </table>
          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px;">
            Ou copie e cole este link no seu navegador:
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #0066cc; word-break: break-all;">
            ${verificationUrl}
          </p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #fef3c7; padding: 20px 30px;">
          <p style="font-size: 13px; line-height: 1.6; color: #92400e; margin: 0;">
            ⚠️ <strong>Importante:</strong> Se você não criou uma conta, ignore este email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            © ${new Date().getFullYear()} ${process.env.VITE_APP_TITLE || 'Architecture Rendering App'}. Todos os direitos reservados.
          </p>
        </td>
      </tr>
    </table>
  `;

    await sendEmail({
      to: email,
      subject,
      html,
    });
  }

  // ============================================
  // PROFILE UPDATE ENDPOINT
  // ============================================

  app.put("/api/auth/profile", async (req, res) => {
    try {
      console.log("[Profile] Cookies recebidos:", req.cookies);
      const token = req.cookies.auth_token;
      if (!token) {
        console.log("[Profile] Token não encontrado nos cookies");
        return res.status(401).json({ error: "Não autenticado" });
      }
      console.log("[Profile] Token encontrado:", token.substring(0, 20) + "...");

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await getUserById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const { name, email, phone } = req.body;
      const updates: any = {};

      // Validação de nome
      if (name !== undefined) {
        if (!name || name.trim().length === 0) {
          return res.status(400).json({ error: "Nome é obrigatório" });
        }
        updates.name = name.trim();
      }

      // Validação de telefone
      if (phone !== undefined) {
        const phoneDigits = phone.replace(/\D/g, "");
        if (!validatePhone(phoneDigits)) {
          return res.status(400).json({ error: "Telefone inválido. Use o formato (##) #####-####" });
        }
        updates.phone = phoneDigits;
      }

      // Validação de email
      if (email !== undefined && email !== user.email) {
        // Valida formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Email inválido" });
        }

        // Verifica se email já existe (current ou histórico)
        const emailExists = await checkEmailExists(email, user.id);
        if (emailExists) {
          return res.status(400).json({ 
            error: "Este email já foi utilizado anteriormente e não pode ser reutilizado" 
          });
        }

        // Salva email antigo no histórico
        if (user.email) {
          await saveEmailHistory(user.id, user.email, email);
        }

        updates.email = email;

        // Envia email de verificação para o novo email
        const verificationToken = crypto.randomBytes(32).toString("hex");
        await updateUserVerificationToken(user.id, verificationToken);
        const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
        await sendVerificationEmail(email, verificationUrl);
        
        updates.emailVerified = 0; // Marca email como não verificado
      }

      // Atualiza perfil
      await updateUserProfile(user.id, updates);

      // Busca usuário atualizado
      const updatedUser = await getUserById(user.id);

      res.json({
        success: true,
        user: {
          id: updatedUser!.id,
          name: updatedUser!.name,
          email: updatedUser!.email,
          phone: updatedUser!.phone,
          emailVerified: updatedUser!.emailVerified,
        },
        message: email !== undefined && email !== user.email
          ? "Perfil atualizado! Verifique seu novo email para confirmar a alteração."
          : "Perfil atualizado com sucesso!",
      });
    } catch (error: any) {
      console.error("[Auth] Error updating profile:", error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });
}
