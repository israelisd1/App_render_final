import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { callArchitectureRenderingAPI } from "./architectureApi";
import { addTokens, createRender, deductTokens, getActiveTokenPackages, getRenderById, getUserTokenTransactions, getUserRenders, updateRenderStatus, getDb, createStripeTransaction, getCouponByCode, getUserStripeTransactions } from "./db";
import { createCheckoutSession, validateCoupon, calculateDiscount } from "./stripe";
import { renders } from "../drizzle/schema";
import { storagePut } from "./storage";
import { getAuthProvider, setAuthProvider, getAllSystemSettings } from "./systemSettings";
import { clearAuthProviderCache } from "./_core/authMiddleware";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  render: router({
    /**
     * Cria uma nova renderização
     */
    create: protectedProcedure
      .input(
        z.object({
          sceneType: z.enum(["interior", "exterior"]),
          outputFormat: z.enum(["webp", "jpg", "png", "avif"]),
          imageBase64: z.string(),
          prompt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 1. Verificar saldo de tokens
        if (ctx.user.tokenBalance < 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saldo de tokens insuficiente. Compre mais tokens para continuar.",
          });
        }

        // 2. Fazer upload da imagem original para S3
        const imageBuffer = Buffer.from(input.imageBase64.split(",")[1], "base64");
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const originalKey = `renders/${ctx.user.id}/original-${timestamp}-${randomSuffix}.${input.outputFormat}`;
        
        const { url: originalImageUrl } = await storagePut(
          originalKey,
          imageBuffer,
          `image/${input.outputFormat}`
        );

        // 3. Determinar qualidade baseada no plano
        const qualityLevel = ctx.user.plan === 'pro' ? 'detailed' : 'standard';
        console.log(`[Render] User plan: ${ctx.user.plan}, quality: ${qualityLevel}`);
        
        // 4. Criar registro no banco
        const result = await createRender({
          userId: ctx.user.id,
          originalImageUrl,
          sceneType: input.sceneType,
          outputFormat: input.outputFormat,
          prompt: input.prompt,
          quality: qualityLevel,
          status: "processing",
        });

        const renderId = Number(result[0].insertId);

        // 4. Deduzir 1 token do saldo
        try {
          await deductTokens(ctx.user.id, 1, renderId, `Renderização #${renderId}`);
          console.log(`[Render ${renderId}] 1 token deduzido. Novo saldo: ${ctx.user.tokenBalance - 1}`);
        } catch (error: any) {
          console.error(`[Render ${renderId}] Erro ao deduzir token:`, error);
          await updateRenderStatus(renderId, "failed", {
            errorMessage: "Erro ao processar pagamento de token",
            completedAt: new Date(),
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao processar pagamento de token",
          });
        }

        // 5. Chamar API de renderização em background
        (async () => {
          try {
            console.log(`[Render ${renderId}] Iniciando chamada à API...`);
            const apiResponse = await callArchitectureRenderingAPI({
              sceneType: input.sceneType,
              outputFormat: input.outputFormat,
              image: originalImageUrl,
              prompt: input.prompt,
            }, ctx.user.plan || 'basic'); // Passa plano do usuário para controlar qualidade

            console.log(`[Render ${renderId}] Resposta da API:`, JSON.stringify(apiResponse));

            if (apiResponse.output) {
              let finalImageUrl = apiResponse.output;
              let highResUrl = null;
              
              // Se usuário é Basic, comprimir imagem para HD
              if (ctx.user.plan !== 'pro') {
                try {
                  console.log(`[Render ${renderId}] Plano Basic/Free detectado - comprimindo imagem para HD...`);
                  const { downloadImage, compressImageToHD } = await import('./imageCompression');
                  const { storagePut } = await import('./storage');
                  
                  // Baixar imagem original da API
                  const originalBuffer = await downloadImage(apiResponse.output);
                  
                  // Comprimir para HD
                  const compressedBuffer = await compressImageToHD(
                    originalBuffer,
                    input.outputFormat as 'jpg' | 'png' | 'webp' | 'avif'
                  );
                  
                  // Upload da versão comprimida para S3
                  const compressedKey = `renders/${ctx.user.id}/compressed-${timestamp}-${randomSuffix}.${input.outputFormat}`;
                  const { url: compressedUrl } = await storagePut(
                    compressedKey,
                    compressedBuffer,
                    `image/${input.outputFormat}`
                  );
                  
                  finalImageUrl = compressedUrl;
                  console.log(`[Render ${renderId}] Imagem comprimida salva em: ${compressedUrl}`);
                } catch (compressionError) {
                  console.error(`[Render ${renderId}] Erro ao comprimir imagem:`, compressionError);
                  // Em caso de erro, usar imagem original da API
                  console.log(`[Render ${renderId}] Usando imagem original da API`);
                }
              } else {
                // Plano Pro: salvar URL original em alta resolução
                console.log(`[Render ${renderId}] Plano Pro - salvando URL de alta resolução`);
                highResUrl = apiResponse.output;
              }
              
              console.log(`[Render ${renderId}] Renderização concluída com sucesso`);
              await updateRenderStatus(renderId, "completed", {
                renderedImageUrl: finalImageUrl,
                highResUrl: highResUrl,
                completedAt: new Date(),
              });
            } else {
              const errorMsg = apiResponse.error || apiResponse.message || "API não retornou imagem renderizada";
              console.error(`[Render ${renderId}] Falha: ${errorMsg}`);
              await updateRenderStatus(renderId, "failed", {
                errorMessage: errorMsg,
                completedAt: new Date(),
              });
            }
          } catch (error: any) {
            console.error(`[Render ${renderId}] Erro na requisição:`, error);
            await updateRenderStatus(renderId, "failed", {
              errorMessage: error.message || "Erro desconhecido ao processar renderização",
              completedAt: new Date(),
            });
          }
        })();

        return { id: renderId };
      }),

    /**
     * Lista renderizações do usuário
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRenders(ctx.user.id);
    }),

    /**
     * Busca uma renderização por ID
     */
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const render = await getRenderById(input.id);
        
        if (!render) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Renderização não encontrada",
          });
        }

        if (render.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        return render;
      }),

    /**
     * Refinar uma renderização existente com novo prompt
     */
    refine: protectedProcedure
      .input(
        z.object({
          parentRenderId: z.number(),
          prompt: z.string().optional(),
          saturation: z.number().min(-100).max(100).optional(),
          brightness: z.number().min(-50).max(50).optional(),
          contrast: z.number().min(-50).max(50).optional(),
          lighting: z.number().min(-30).max(30).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // 1. Verificar saldo de tokens
        if (ctx.user.tokenBalance < 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Saldo de tokens insuficiente. Compre mais tokens para continuar.",
          });
        }

        // 2. Buscar renderização original
        const parentRender = await getRenderById(input.parentRenderId);
        
        if (!parentRender) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Renderização original não encontrada",
          });
        }

        if (parentRender.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Acesso negado",
          });
        }

        if (parentRender.status !== "completed" || !parentRender.renderedImageUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Apenas renderizações concluídas podem ser refinadas",
          });
        }

        // 3. Criar nova renderização usando a imagem renderizada como base
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(renders).values({
          userId: ctx.user.id,
          originalImageUrl: parentRender.renderedImageUrl, // Usar imagem renderizada como base
          sceneType: parentRender.sceneType,
          outputFormat: parentRender.outputFormat,
          prompt: input.prompt,
          parentRenderId: input.parentRenderId, // Rastrear origem
          adjustmentSaturation: input.saturation ?? 0,
          adjustmentBrightness: input.brightness ?? 0,
          adjustmentContrast: input.contrast ?? 0,
          adjustmentLighting: input.lighting ?? 0,
          status: "processing",
        });

        const renderId = Number(result[0].insertId);

        // 4. Deduzir 1 token do saldo
        try {
          await deductTokens(ctx.user.id, 1, renderId, `Refinamento #${renderId}`);
          console.log(`[Refine ${renderId}] 1 token deduzido. Novo saldo: ${ctx.user.tokenBalance - 1}`);
        } catch (error: any) {
          console.error(`[Refine ${renderId}] Erro ao deduzir token:`, error);
          await updateRenderStatus(renderId, "failed", {
            errorMessage: "Erro ao processar pagamento de token",
            completedAt: new Date(),
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao processar pagamento de token",
          });
        }

        // 5. Chamar API de renderização em background
        (async () => {
          try {
            console.log(`[Refine ${renderId}] Iniciando refinamento da renderização ${input.parentRenderId}...`);
            const apiResponse = await callArchitectureRenderingAPI({
              sceneType: parentRender.sceneType,
              outputFormat: parentRender.outputFormat as "webp" | "jpg" | "png" | "avif",
              image: parentRender.renderedImageUrl!,
              prompt: input.prompt,
            });

            console.log(`[Refine ${renderId}] Resposta da API:`, JSON.stringify(apiResponse));

            if (apiResponse.output) {
              console.log(`[Refine ${renderId}] Refinamento concluído com sucesso`);
              await updateRenderStatus(renderId, "completed", {
                renderedImageUrl: apiResponse.output,
                completedAt: new Date(),
              });
            } else {
              const errorMsg = apiResponse.error || apiResponse.message || "API não retornou imagem renderizada";
              console.error(`[Refine ${renderId}] Falha: ${errorMsg}`);
              await updateRenderStatus(renderId, "failed", {
                errorMessage: errorMsg,
                completedAt: new Date(),
              });
            }
          } catch (error: any) {
            console.error(`[Refine ${renderId}] Erro na requisição:`, error);
            await updateRenderStatus(renderId, "failed", {
              errorMessage: error.message || "Erro desconhecido ao processar refinamento",
              completedAt: new Date(),
            });
          }
        })();

        return { id: renderId };
      }),
  }),

  /**
   * Rotas relacionadas a tokens
   */
  tokens: router({
    /**
     * Lista pacotes de tokens disponíveis
     */
    listPackages: publicProcedure.query(async () => {
      return await getActiveTokenPackages();
    }),

    /**
     * Valida um cupom de desconto
     */
    validateCoupon: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ input }) => {
        const coupon = await getCouponByCode(input.code.toUpperCase());

        if (!coupon) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cupom não encontrado",
          });
        }

        const validation = validateCoupon(coupon);

        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.reason || "Cupom inválido",
          });
        }

        return {
          valid: true,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        };
      }),

    /**
     * Cria uma sessão de checkout do Stripe
     */
    createCheckout: protectedProcedure
      .input(
        z.object({
          packageId: z.number(),
          couponCode: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const packages = await getActiveTokenPackages();
        const pkg = packages.find((p) => p.id === input.packageId);

        if (!pkg) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Pacote não encontrado",
          });
        }

        let finalPrice = pkg.priceInCents;
        let discountAmount = 0;
        let couponCode: string | undefined;

        // Validar e aplicar cupom se fornecido
        if (input.couponCode) {
          const coupon = await getCouponByCode(input.couponCode.toUpperCase());

          if (coupon) {
            const validation = validateCoupon(coupon);

            if (validation.valid) {
              discountAmount = calculateDiscount(pkg.priceInCents, coupon);
              finalPrice = pkg.priceInCents - discountAmount;
              couponCode = coupon.code;
              console.log(
                `[Checkout] Cupom ${coupon.code} aplicado. Desconto: R$ ${(discountAmount / 100).toFixed(2)}`
              );
            }
          }
        }

        // Criar sessão de checkout do Stripe
        const baseUrl = ctx.req.headers.origin || "http://localhost:3000";
        const session = await createCheckoutSession({
          userId: ctx.user.id,
          packageId: pkg.id,
          packageName: pkg.name,
          tokenAmount: pkg.tokenAmount,
          priceInCents: finalPrice,
          couponCode,
          successUrl: `${baseUrl}/tokens/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/tokens`,
        });

        // Registrar transação como pendente
        await createStripeTransaction({
          userId: ctx.user.id,
          sessionId: session.id,
          amount: finalPrice,
          currency: "brl",
          tokenPackageId: pkg.id,
          tokensAmount: pkg.tokenAmount,
          status: "pending",
          couponCode,
          discountAmount,
        });

        console.log(
          `[Checkout] Sessão criada para usuário ${ctx.user.id}: ${session.id}`
        );

        return { checkoutUrl: session.url };
      }),

    /**
     * Busca histórico de transações Stripe do usuário
     */
    stripeTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await getUserStripeTransactions(ctx.user.id);
    }),

    /**
     * Busca histórico de transações do usuário
     */
    transactions: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTokenTransactions(ctx.user.id);
    }),
  }),

  /**
   * Admin router - apenas para usuários admin
   */
  admin: router({
    /**
     * Busca estatísticas gerais do sistema
     */
    stats: protectedProcedure.query(async ({ ctx }) => {
      // Verificar se é admin
      if (ctx.user.email !== 'israelisd@gmail.com') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Acesso negado. Apenas administradores podem acessar.',
        });
      }

      const { getAdminStats } = await import('./db');
      return await getAdminStats();
    }),

    /**
     * Busca todos os usuários com estatísticas
     */
    users: protectedProcedure.query(async ({ ctx }) => {
      // Verificar se é admin
      if (ctx.user.email !== 'israelisd@gmail.com') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Acesso negado. Apenas administradores podem acessar.',
        });
      }

      const { getAllUsersWithStats } = await import('./db');
      return await getAllUsersWithStats();
    }),

    /**
     * Busca detalhes de um usuário específico
     */
    userDetails: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verificar se é admin
        if (ctx.user.email !== 'israelisd@gmail.com') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Acesso negado. Apenas administradores podem acessar.',
          });
        }

        const { getUserDetailedStats } = await import('./db');
        return await getUserDetailedStats(input.userId);
      }),
  }),

  subscription: router({
    /**
     * Retorna status da assinatura do usuário
     */
    status: protectedProcedure.query(async ({ ctx }) => {
      return {
        plan: ctx.user.plan || 'free',
        subscriptionStatus: ctx.user.subscriptionStatus,
        monthlyQuota: ctx.user.monthlyQuota || 0,
        monthlyRendersUsed: ctx.user.monthlyRendersUsed || 0,
        extraRenders: ctx.user.extraRenders || 0,
        billingPeriodStart: ctx.user.billingPeriodStart,
        billingPeriodEnd: ctx.user.billingPeriodEnd,
        stripeCustomerId: ctx.user.stripeCustomerId,
        subscriptionId: ctx.user.subscriptionId,
      };
    }),

    /**
     * Cancela assinatura do usuário
     */
    cancel: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.subscriptionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nenhuma assinatura ativa encontrada',
        });
      }

      const stripe = (await import('./stripe')).stripe;
      await stripe.subscriptions.update(ctx.user.subscriptionId, {
        cancel_at_period_end: true,
      });

      return { success: true };
    }),

    /**
     * Reativa assinatura cancelada
     */
    reactivate: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.subscriptionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nenhuma assinatura encontrada',
        });
      }

      const stripe = (await import('./stripe')).stripe;
      await stripe.subscriptions.update(ctx.user.subscriptionId, {
        cancel_at_period_end: false,
      });

      return { success: true };
    }),

    /**
     * Abre portal do Stripe para gerenciar assinatura
     */
    portal: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user.stripeCustomerId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Nenhum cliente Stripe encontrado',
        });
      }

      const stripeModule = await import('./stripe');
      const stripe = stripeModule.stripe;
      
      if (!stripe) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe não configurado",
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: ctx.user.stripeCustomerId,
        return_url: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/subscription`,
      });

      return { url: session.url };
    }),
  }),

  /**
   * Router de configurações do sistema (admin only)
   * Permite alternar entre OAuth Manus e NextAuth via painel admin
   */
  systemConfig: router({
    /**
     * Obter sistema de autenticação ativo (público para detecção no frontend)
     */
    getAuthProvider: publicProcedure.query(async () => {
      const provider = await getAuthProvider();
      return provider;
    }),

    /**
     * Definir sistema de autenticação ativo
     */
    setAuthProvider: protectedProcedure
      .input(
        z.object({
          provider: z.enum(["manus", "nextauth"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Apenas admin pode alterar
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas administradores podem alterar configurações do sistema",
          });
        }

        const success = await setAuthProvider(input.provider, ctx.user.email || undefined);
        
        if (success) {
          // Limpar cache para aplicar imediatamente
          clearAuthProviderCache();
          console.log(`[SystemConfig] Auth provider changed to: ${input.provider} by ${ctx.user.email}`);
        }

        return { success };
      }),

    /**
     * Listar todas as configurações
     */
    getAllSettings: protectedProcedure.query(async ({ ctx }) => {
      // Apenas admin pode ver
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem acessar configurações do sistema",
        });
      }

      const settings = await getAllSystemSettings();
      return { settings };
    }),
  }),
});

export type AppRouter = typeof appRouter;
