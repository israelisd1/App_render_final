/**
 * Sistema de Autenticação Customizado
 * Suporta Email/Senha e Google OAuth via Arctic
 */

import { Request, Response, NextFunction, Express } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Google } from "arctic";
import * as db from "../db";

// Configuração Arctic Google OAuth
const google = new Google(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
  `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`
);

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
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Verificar se usuário já existe
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário
      await db.createUser({
        email,
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

      const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
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
      const tokens = await google.validateAuthorizationCode(code as string, codeVerifier);

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

      // TODO: Enviar email com link de reset
      console.log(`[Auth] Reset token for ${email}: ${resetToken}`);
      console.log(`[Auth] Reset link: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);

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
}

