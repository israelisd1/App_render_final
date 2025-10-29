import { Express, Request, Response } from "express";
import NextAuth from "next-auth";
import { authOptions } from "./nextauth.config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as db from "../db";

/**
 * Registrar rotas de autenticação NextAuth
 */
export function registerAuthRoutes(app: Express) {
  // NextAuth API routes
  app.all("/api/auth/*", async (req: Request, res: Response) => {
    return await NextAuth(req as any, res as any, authOptions);
  });

  // Rota de registro (signup)
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validações
      if (!email || !password) {
        return res.status(400).json({
          error: "Email e senha são obrigatórios",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "A senha deve ter no mínimo 6 caracteres",
        });
      }

      // Verificar se usuário já existe
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: "Este email já está cadastrado",
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Gerar token de verificação
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Criar usuário
      await db.createUser({
        email,
        password: hashedPassword,
        name: name || null,
        provider: "email",
        emailVerified: 0, // Não verificado inicialmente
        verificationToken,
        tokenBalance: 3, // 3 tokens gratuitos
      });

      // TODO: Enviar email de verificação
      // await sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        message: "Conta criada com sucesso! Verifique seu email para ativar sua conta.",
        email,
      });
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      res.status(500).json({
        error: "Erro ao criar conta. Tente novamente.",
      });
    }
  });

  // Rota de verificação de email
  app.get("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        return res.status(400).json({
          error: "Token inválido",
        });
      }

      // Buscar usuário pelo token
      const user = await db.getUserByVerificationToken(token);

      if (!user) {
        return res.status(400).json({
          error: "Token inválido ou expirado",
        });
      }

      // Verificar email
      await db.verifyUserEmail(user.id);

      res.status(200).json({
        message: "Email verificado com sucesso! Você já pode fazer login.",
      });
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      res.status(500).json({
        error: "Erro ao verificar email. Tente novamente.",
      });
    }
  });

  // Rota de solicitação de reset de senha
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email é obrigatório",
        });
      }

      // Buscar usuário
      const user = await db.getUserByEmail(email);

      if (!user) {
        // Por segurança, não revelar se o email existe ou não
        return res.status(200).json({
          message: "Se o email existir, você receberá instruções para redefinir sua senha.",
        });
      }

      // Verificar se o usuário usa login com email/senha
      if (user.provider !== "email") {
        return res.status(400).json({
          error: `Esta conta usa login com ${user.provider}`,
        });
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco
      await db.setResetPasswordToken(user.id, resetToken, resetExpires);

      // TODO: Enviar email com link de reset
      // await sendResetPasswordEmail(email, resetToken);

      res.status(200).json({
        message: "Se o email existir, você receberá instruções para redefinir sua senha.",
      });
    } catch (error) {
      console.error("Erro ao solicitar reset de senha:", error);
      res.status(500).json({
        error: "Erro ao processar solicitação. Tente novamente.",
      });
    }
  });

  // Rota de reset de senha
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          error: "Token e senha são obrigatórios",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "A senha deve ter no mínimo 6 caracteres",
        });
      }

      // Buscar usuário pelo token
      const user = await db.getUserByResetToken(token);

      if (!user) {
        return res.status(400).json({
          error: "Token inválido ou expirado",
        });
      }

      // Verificar se o token expirou
      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        return res.status(400).json({
          error: "Token expirado. Solicite um novo reset de senha.",
        });
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Atualizar senha e limpar tokens
      await db.updateUserPassword(user.id, hashedPassword);

      res.status(200).json({
        message: "Senha redefinida com sucesso! Você já pode fazer login.",
      });
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({
        error: "Erro ao redefinir senha. Tente novamente.",
      });
    }
  });
}

