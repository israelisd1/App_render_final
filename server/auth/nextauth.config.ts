import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import * as db from "../db";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Email/Password Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        // Buscar usuário por email
        const user = await db.getUserByEmail(credentials.email);

        if (!user) {
          throw new Error("Credenciais inválidas");
        }

        // Verificar se o usuário usa login com email/senha
        if (user.provider !== "email") {
          throw new Error(`Esta conta usa login com ${user.provider}`);
        }

        // Verificar senha
        if (!user.password) {
          throw new Error("Senha não configurada para este usuário");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciais inválidas");
        }

        // Verificar se o email foi verificado
        if (!user.emailVerified) {
          throw new Error("Por favor, verifique seu email antes de fazer login");
        }

        // Atualizar último login
        await db.updateUserLastSignIn(user.id);

        return {
          id: user.id.toString(),
          email: user.email || "",
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Login com Google
        const email = user.email;
        if (!email) {
          return false;
        }

        // Verificar se usuário já existe
        let existingUser = await db.getUserByEmail(email);

        if (existingUser) {
          // Usuário existe - atualizar último login
          await db.updateUserLastSignIn(existingUser.id);
        } else {
          // Criar novo usuário
          await db.createUser({
            email,
            name: user.name || null,
            provider: "google",
            emailVerified: 1, // Google já verifica o email
            tokenBalance: 3, // 3 tokens gratuitos
          });
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // Adicionar informações do usuário ao token JWT
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Buscar informações atualizadas do usuário
      if (token.email) {
        const dbUser = await db.getUserByEmail(token.email as string);
        if (dbUser) {
          token.id = dbUser.id.toString();
          token.tokenBalance = dbUser.tokenBalance;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Adicionar informações do token à sessão
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tokenBalance = token.tokenBalance as number;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  secret: process.env.NEXTAUTH_SECRET,
};

