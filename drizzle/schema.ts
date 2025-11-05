import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) - opcional, usado apenas para OAuth providers */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Senha hash (bcrypt) - usado apenas para login com email/senha */
  password: varchar("password", { length: 255 }),
  /** Provider de autenticação: 'email', 'google', 'manus' */
  provider: varchar("provider", { length: 64 }).default("email").notNull(),
  /** Se o email foi verificado */
  emailVerified: int("emailVerified").default(0).notNull(), // 0 = não verificado, 1 = verificado
  /** Token de verificação de email */
  verificationToken: varchar("verificationToken", { length: 255 }),
  /** Token de reset de senha */
  resetPasswordToken: varchar("resetPasswordToken", { length: 255 }),
  /** Expiração do token de reset */
  resetPasswordExpires: timestamp("resetPasswordExpires"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Sistema de Tokens (DEPRECATED - manter por compatibilidade)
  tokenBalance: int("tokenBalance").default(3).notNull(), // Saldo de tokens (inicia com 3)
  
  // Sistema de Assinaturas (NOVO)
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }), // ID do customer no Stripe
  subscriptionId: varchar("subscriptionId", { length: 255 }), // ID da assinatura no Stripe
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due", "inactive"]).default("inactive"),
  plan: mysqlEnum("plan", ["free", "basic", "pro"]).default("free").notNull(),
  monthlyQuota: int("monthlyQuota").default(0).notNull(), // Quota mensal de renderizações
  monthlyRendersUsed: int("monthlyRendersUsed").default(0).notNull(), // Renderizações usadas no mês
  extraRenders: int("extraRenders").default(0).notNull(), // Renderizações extras compradas
  billingPeriodStart: timestamp("billingPeriodStart"), // Início do período de cobrança
  billingPeriodEnd: timestamp("billingPeriodEnd"), // Fim do período de cobrança
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para armazenar histórico de renderizações
 */
export const renders = mysqlTable("renders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalImageUrl: text("originalImageUrl").notNull(),
  renderedImageUrl: text("renderedImageUrl"),
  highResUrl: text("highResUrl"), // URL original da API em alta resolução (apenas Pro)
  sceneType: mysqlEnum("sceneType", ["interior", "exterior"]).notNull(),
  outputFormat: varchar("outputFormat", { length: 10 }).notNull(),
  prompt: text("prompt"),
  parentRenderId: int("parentRenderId"), // ID da renderização original (para refinamentos)
  // Parâmetros de ajuste visual (para refinamentos)
  adjustmentSaturation: int("adjustmentSaturation"), // -100 a +100
  adjustmentBrightness: int("adjustmentBrightness"), // -50 a +50
  adjustmentContrast: int("adjustmentContrast"), // -50 a +50
  adjustmentLighting: int("adjustmentLighting"), // -30 a +30
  quality: mysqlEnum("quality", ["standard", "detailed"]).default("standard"), // Qualidade da renderização
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Render = typeof renders.$inferSelect;
export type InsertRender = typeof renders.$inferInsert;

/**
 * Pacotes de tokens disponíveis para compra
 */
export const tokenPackages = mysqlTable("token_packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // Ex: "Pacote Inicial"
  tokenAmount: int("tokenAmount").notNull(), // Quantidade de tokens
  priceInCents: int("priceInCents").notNull(), // Preço em centavos (ex: 5000 = R$ 50,00)
  pricePerToken: int("pricePerToken").notNull(), // Preço por token em centavos
  isActive: int("isActive").default(1).notNull(), // 1 = ativo, 0 = inativo
  displayOrder: int("displayOrder").default(0).notNull(), // Ordem de exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenPackage = typeof tokenPackages.$inferSelect;
export type InsertTokenPackage = typeof tokenPackages.$inferInsert;

/**
 * Histórico de transações de tokens
 */
export const tokenTransactions = mysqlTable("token_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund", "bonus"]).notNull(),
  amount: int("amount").notNull(), // Positivo para crédito, negativo para débito
  balanceBefore: int("balanceBefore").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  packageId: int("packageId"), // Referência ao pacote comprado (se type = purchase)
  renderId: int("renderId"), // Referência à renderização (se type = usage)
  priceInCents: int("priceInCents"), // Valor pago (se type = purchase)
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // Ex: "credit_card", "pix"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

/**
 * Transações do Stripe para rastreamento de pagamentos
 */
export const stripeTransactions = mysqlTable("stripe_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 255 }).unique(), // Stripe Checkout Session ID
  paymentIntentId: varchar("paymentIntentId", { length: 255 }), // Stripe Payment Intent ID
  amount: int("amount").notNull(), // Valor em centavos
  currency: varchar("currency", { length: 3 }).default("brl").notNull(),
  tokenPackageId: int("tokenPackageId"),
  tokensAmount: int("tokensAmount").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // "card", "pix", etc
  couponCode: varchar("couponCode", { length: 100 }), // Cupom aplicado
  discountAmount: int("discountAmount").default(0), // Desconto em centavos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type StripeTransaction = typeof stripeTransactions.$inferSelect;
export type InsertStripeTransaction = typeof stripeTransactions.$inferInsert;

/**
 * Cupons de desconto
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(), // Porcentagem (ex: 10 = 10%) ou valor fixo em centavos
  maxUses: int("maxUses"), // Número máximo de usos (null = ilimitado)
  usedCount: int("usedCount").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;