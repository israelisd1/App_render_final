import { desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertRender, InsertUser, renders, tokenPackages, tokenTransactions, users, stripeTransactions, InsertStripeTransaction, coupons, Coupon } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "provider"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    // Dar 3 renderizações gratuitas para novos usuários
    // Apenas na criação (INSERT), não no UPDATE
    values.extraRenders = 3;

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Cria um novo registro de renderização
 */
export async function createRender(render: InsertRender) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(renders).values(render);
  return result;
}

/**
 * Atualiza o status de uma renderização
 */
export async function updateRenderStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  data?: { renderedImageUrl?: string; highResUrl?: string | null; errorMessage?: string; completedAt?: Date }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (data?.renderedImageUrl) updateData.renderedImageUrl = data.renderedImageUrl;
  if (data?.highResUrl !== undefined) updateData.highResUrl = data.highResUrl;
  if (data?.errorMessage) updateData.errorMessage = data.errorMessage;
  if (data?.completedAt) updateData.completedAt = data.completedAt;
  
  await db.update(renders).set(updateData).where(eq(renders.id, id));
}

/**
 * Busca renderizações de um usuário
 */
export async function getUserRenders(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(renders).where(eq(renders.userId, userId)).orderBy(desc(renders.createdAt));
}

/**
 * Busca uma renderização por ID
 */
export async function getRenderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(renders).where(eq(renders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


/**
 * Busca todos os pacotes de tokens ativos
 */
export async function getActiveTokenPackages() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(tokenPackages).where(eq(tokenPackages.isActive, 1)).orderBy(tokenPackages.displayOrder);
}

/**
 * Deduz tokens do saldo do usuário e registra transação
 */
export async function deductTokens(userId: number, amount: number, renderId?: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar saldo atual
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const balanceBefore = user[0].tokenBalance;
  const balanceAfter = balanceBefore - amount;

  if (balanceAfter < 0) {
    throw new Error("Insufficient token balance");
  }

  // Atualizar saldo
  await db.update(users).set({ tokenBalance: balanceAfter }).where(eq(users.id, userId));

  // Registrar transação
  await db.insert(tokenTransactions).values({
    userId,
    type: "usage",
    amount: -amount,
    balanceBefore,
    balanceAfter,
    renderId,
    description: description || `Renderização #${renderId}`,
    paymentStatus: "completed",
  });

  return balanceAfter;
}

/**
 * Adiciona tokens ao saldo do usuário e registra transação
 */
export async function addTokens(userId: number, amount: number, packageId?: number, priceInCents?: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar saldo atual
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.length === 0) throw new Error("User not found");

  const balanceBefore = user[0].tokenBalance;
  const balanceAfter = balanceBefore + amount;

  // Atualizar saldo
  await db.update(users).set({ tokenBalance: balanceAfter }).where(eq(users.id, userId));

  // Registrar transação
  await db.insert(tokenTransactions).values({
    userId,
    type: "purchase",
    amount,
    balanceBefore,
    balanceAfter,
    packageId,
    priceInCents,
    description: description || `Compra de ${amount} tokens`,
    paymentStatus: "completed",
  });

  return balanceAfter;
}

/**
 * Busca histórico de transações do usuário
 */
export async function getUserTokenTransactions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(tokenTransactions).where(eq(tokenTransactions.userId, userId)).orderBy(desc(tokenTransactions.createdAt));
}




// ============================================
// STRIPE TRANSACTIONS
// ============================================

export async function createStripeTransaction(transaction: InsertStripeTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(stripeTransactions).values(transaction);
  return result.insertId;
}

export async function getStripeTransactionBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stripeTransactions)
    .where(eq(stripeTransactions.sessionId, sessionId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateStripeTransaction(
  sessionId: string,
  updates: {
    status?: "pending" | "completed" | "failed" | "refunded";
    paymentIntentId?: string;
    paymentMethod?: string;
    completedAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(stripeTransactions)
    .set(updates)
    .where(eq(stripeTransactions.sessionId, sessionId));
}

export async function getUserStripeTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(stripeTransactions)
    .where(eq(stripeTransactions.userId, userId))
    .orderBy(desc(stripeTransactions.createdAt));
}

// ============================================
// COUPONS
// ============================================

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function incrementCouponUsage(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(coupons)
    .set({ usedCount: eq(coupons.usedCount, coupons.usedCount) })
    .where(eq(coupons.code, code));
}

export async function createCoupon(coupon: {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  expiresAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(coupons).values(coupon);
  return result.insertId;
}


// ============================================
// Admin Functions
// ============================================

export async function getAllUsersWithStats() {
  const db = await getDb();
  if (!db) return [];

  try {
    const usersData = await db.select().from(users);
    
    // Para cada usuário, buscar estatísticas
    const usersWithStats = await Promise.all(
      usersData.map(async (user) => {
        // Total de tokens comprados
        const purchases = await db
          .select()
          .from(tokenTransactions)
          .where(eq(tokenTransactions.userId, user.id));
        
        const totalTokensPurchased = purchases.filter(p => p.type === 'purchase').reduce((sum, p) => sum + p.amount, 0);
        const totalSpent = purchases.filter(p => p.type === 'purchase' && p.priceInCents).reduce((sum, p) => sum + (p.priceInCents || 0), 0);

        // Total de renderizações
        const userRenders = await db
          .select()
          .from(renders)
          .where(eq(renders.userId, user.id));
        
        const totalRendersCount = userRenders.length;
        const tokensUsed = userRenders.length; // 1 token por renderização

        return {
          ...user,
          totalTokensPurchased,
          totalSpent,
          totalRendersCount,
          tokensUsed,
        };
      })
    );

    return usersWithStats;
  } catch (error) {
    console.error("[Database] Failed to get users with stats:", error);
    return [];
  }
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  try {
    // Total de usuários
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    // Total de tokens comprados
    const allPurchases = await db.select().from(tokenTransactions);
    const totalTokensPurchased = allPurchases.filter(p => p.type === 'purchase').reduce((sum, p) => sum + p.amount, 0);
    const totalRevenue = allPurchases.filter(p => p.type === 'purchase' && p.priceInCents).reduce((sum, p) => sum + (p.priceInCents || 0), 0);

    // Total de renderizações
    const allRenders = await db.select().from(renders);
    const totalRenders = allRenders.length;
    const totalTokensUsed = allRenders.length;

    return {
      totalUsers,
      totalTokensPurchased,
      totalTokensUsed,
      totalRenders,
      totalRevenue,
    };
  } catch (error) {
    console.error("[Database] Failed to get admin stats:", error);
    return null;
  }
}

export async function getUserDetailedStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) return null;

    // Histórico de compras
    const purchases = await db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, userId))
      .orderBy(desc(tokenTransactions.createdAt));

    // Histórico de renderizações
    const userRenders = await db
      .select()
      .from(renders)
      .where(eq(renders.userId, userId))
      .orderBy(desc(renders.createdAt));

    return {
      user: user[0],
      purchases,
      renders: userRenders,
    };
  } catch (error) {
    console.error("[Database] Failed to get user detailed stats:", error);
    return null;
  }
}



// ============================================
// NEXTAUTH FUNCTIONS
// ============================================

/**
 * Buscar usuário por email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Buscar usuário por CPF
 */
export async function getUserByCPF(cpf: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.cpf, cpf)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Criar novo usuário (para NextAuth)
 */
export async function createUser(userData: {
  email: string;
  cpf: string;
  phone: string;
  name?: string | null;
  password?: string | null;
  provider: string;
  emailVerified?: number;
  verificationToken?: string | null;
  tokenBalance?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(users).values({
    email: userData.email,
    cpf: userData.cpf,
    phone: userData.phone,
    name: userData.name || null,
    password: userData.password || null,
    provider: userData.provider,
    emailVerified: userData.emailVerified || 0,
    verificationToken: userData.verificationToken || null,
    tokenBalance: userData.tokenBalance || 3,
    extraRenders: 3, // 3 renderizações gratuitas
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  });

  return result.insertId;
}

/**
 * Atualizar último login do usuário
 */
export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

/**
 * Atualizar token de verificação de email
 */
export async function updateUserVerificationToken(userId: number, token: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update verification token: database not available");
    return;
  }

  await db
    .update(users)
    .set({ verificationToken: token, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Buscar usuário por token de verificação
 */
export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Verificar email do usuário
 */
export async function verifyUserEmail(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    emailVerified: 1,
    verificationToken: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

/**
 * Definir token de reset de senha
 */
export async function setResetPasswordToken(userId: number, token: string, expires: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    resetPasswordToken: token,
    resetPasswordExpires: expires,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

/**
 * Buscar usuário por token de reset de senha
 */
export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.resetPasswordToken, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Atualizar senha do usuário
 */
export async function updateUserPassword(userId: number, hashedPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}



// ============================================================================
// SUBSCRIPTION FUNCTIONS
// ============================================================================

/**
 * Verifica se o usuário pode criar uma nova renderização
 * Retorna true se tiver quota disponível (mensal ou extra)
 */
export async function canUserRender(userId: number): Promise<{ canRender: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) return { canRender: false, reason: 'Database not available' };

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) return { canRender: false, reason: 'User not found' };

  const userData = user[0];

  // Verificar se precisa resetar quota mensal
  if (userData.billingPeriodEnd && new Date() > new Date(userData.billingPeriodEnd)) {
    await resetMonthlyQuota(userId);
    // Recarregar dados do usuário após reset
    const updatedUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (updatedUser.length) {
      Object.assign(userData, updatedUser[0]);
    }
  }

  const totalAvailable = (userData.monthlyQuota - userData.monthlyRendersUsed) + userData.extraRenders;

  if (totalAvailable <= 0) {
    return {
      canRender: false,
      reason: userData.plan === 'free' 
        ? 'No active subscription. Please subscribe to a plan.'
        : 'Monthly quota exceeded. Purchase extra renders or upgrade your plan.'
    };
  }

  return { canRender: true };
}

/**
 * Decrementa a quota do usuário após criar uma renderização
 * Usa quota mensal primeiro, depois renders extras
 */
export async function decrementQuota(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) throw new Error('User not found');

  const userData = user[0];

  if (userData.monthlyRendersUsed < userData.monthlyQuota) {
    // Usa quota mensal
    await db.update(users)
      .set({ monthlyRendersUsed: userData.monthlyRendersUsed + 1 })
      .where(eq(users.id, userId));
  } else if (userData.extraRenders > 0) {
    // Usa renders extras
    await db.update(users)
      .set({ extraRenders: userData.extraRenders - 1 })
      .where(eq(users.id, userId));
  } else {
    throw new Error('No quota available');
  }
}

/**
 * Reseta a quota mensal do usuário e inicia novo período de cobrança
 */
export async function resetMonthlyQuota(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await db.update(users)
    .set({
      monthlyRendersUsed: 0,
      billingPeriodStart: now,
      billingPeriodEnd: nextMonth,
    })
    .where(eq(users.id, userId));
}

/**
 * Atualiza informações de assinatura do usuário após evento do Stripe
 */
export async function updateUserSubscription(params: {
  userId: number;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'inactive';
  plan?: 'free' | 'basic' | 'pro';
  monthlyQuota?: number;
}): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const updateData: any = {};

  if (params.stripeCustomerId !== undefined) updateData.stripeCustomerId = params.stripeCustomerId;
  if (params.subscriptionId !== undefined) updateData.subscriptionId = params.subscriptionId;
  if (params.subscriptionStatus !== undefined) updateData.subscriptionStatus = params.subscriptionStatus;
  if (params.plan !== undefined) updateData.plan = params.plan;
  if (params.monthlyQuota !== undefined) updateData.monthlyQuota = params.monthlyQuota;

  // Se está ativando uma assinatura, iniciar período de cobrança
  if (params.subscriptionStatus === 'active' && params.monthlyQuota) {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    updateData.billingPeriodStart = now;
    updateData.billingPeriodEnd = nextMonth;
    updateData.monthlyRendersUsed = 0;
  }

  // Se está cancelando, manter até o final do período
  if (params.subscriptionStatus === 'canceled') {
    // Não altera billingPeriodEnd - usuário mantém acesso até lá
    updateData.subscriptionStatus = 'canceled';
  }

  await db.update(users)
    .set(updateData)
    .where(eq(users.id, params.userId));
}

/**
 * Adiciona renders extras ao usuário (compra de pacote)
 */
export async function addExtraRenders(userId: number, amount: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) throw new Error('User not found');

  const currentExtra = user[0].extraRenders;

  await db.update(users)
    .set({ extraRenders: currentExtra + amount })
    .where(eq(users.id, userId));
}

/**
 * Busca usuário por Stripe Customer ID
 */
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca usuário por ID
 */
export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}




// ============================================
// PROFILE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Verifica se um email já existe (current ou histórico)
 */
export async function checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Verifica email atual
    const currentUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (currentUsers.length > 0) {
      // Se encontrou, verifica se é do próprio usuário
      if (excludeUserId && currentUsers[0].id === excludeUserId) {
        return false; // É o próprio email do usuário
      }
      return true; // Email já usado por outro usuário
    }

    // Verifica histórico de emails
    const { emailHistory } = await import("../drizzle/schema");
    const historyEmails = await db
      .select()
      .from(emailHistory)
      .where(
        or(
          eq(emailHistory.oldEmail, email),
          eq(emailHistory.newEmail, email)
        )
      )
      .limit(1);

    return historyEmails.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check email:", error);
    return false;
  }
}

/**
 * Salva alteração de email no histórico
 */
export async function saveEmailHistory(userId: number, oldEmail: string, newEmail: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const { emailHistory } = await import("../drizzle/schema");
    await db.insert(emailHistory).values({
      userId,
      oldEmail,
      newEmail,
    });
  } catch (error) {
    console.error("[Database] Failed to save email history:", error);
    throw error;
  }
}

/**
 * Atualiza perfil do usuário
 */
export async function updateUserProfile(
  userId: number,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.email !== undefined) {
      updateData.email = updates.email;
      updateData.emailVerified = 0; // Resetar verificação ao trocar email
    }

    if (updates.phone !== undefined) {
      updateData.phone = updates.phone;
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, userId));
    }
  } catch (error) {
    console.error("[Database] Failed to update user profile:", error);
    throw error;
  }
}

