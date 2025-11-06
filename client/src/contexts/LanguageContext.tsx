import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "pt-BR" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  "pt-BR": {
    // Header
    "header.hello": "Olá",
    "header.tokens": "tokens",
    "header.buyTokens": "Comprar Tokens",
    "header.newRender": "Nova Renderização",
    "header.history": "Histórico",
    "header.logout": "Sair",
    "header.login": "Fazer Login",
    "header.basicPlan": "Basic",
    "header.proPlan": "Pro",
    "header.viewPlans": "Ver Planos",
    
    // Home Page
    "home.title": "Arqrender",
    "home.subtitle": "Renderização Arquitetônica Avançada",
    "home.description": "Transforme seus desenhos 2D em renderizações fotorrealistas de alta qualidade em segundos. Perfeito para arquitetos, designers de interiores e profissionais da construção.",
    "home.cta": "Começar a Renderizar",
    "home.ctaLogin": "Começar Agora",
    "home.feature1.title": "Rápido",
    "home.feature1.description": "Renderizações em 10-30 segundos. Sem espera, sem complicação.",
    "home.feature2.title": "Realista",
    "home.feature2.description": "Algoritmos avançados que preservam geometria e adicionam iluminação realista automaticamente.",
    "home.feature3.title": "Profissional",
    "home.feature3.description": "Usado por arquitetos e designers em mais de 90 países.",
    
    // Render Page
    "render.title": "Nova Renderização",
    "render.authRequired": "Autenticação Necessária",
    "render.authDescription": "Você precisa estar autenticado para criar renderizações.",
    "render.uploadImage": "Upload de Imagem",
    "render.uploadDescription": "Envie sua imagem 2D (planta, esboço ou render básico)",
    "render.selectImage": "Selecionar Imagem",
    "render.sceneType": "Tipo de Cena",
    "render.interior": "Interior",
    "render.exterior": "Exterior",
    "render.outputFormat": "Formato de Saída",
    "render.prompt": "Descrição/Orientações (opcional)",
    "render.promptPlaceholder": "Ex: Estilo moderno, iluminação natural, cores neutras...",
    "render.promptHelp": "Descreva o estilo e atmosfera desejados para a renderização",
    "render.submit": "Iniciar Renderização",
    "render.processing": "Processando...",
    
    // History Page
    "history.title": "Histórico de Renderizações",
    "history.newRender": "+ Nova Renderização",
    "history.empty": "Nenhuma renderização encontrada",
    "history.createFirst": "Criar sua primeira renderização",
    "history.status.processing": "Processando",
    "history.status.completed": "Concluído",
    "history.status.failed": "Falhou",
    "history.download": "Baixar Imagem",
    "history.downloadHD": "📥 Download Alta Resolução (Pro)",
    "history.downloadUltraHD": "📥 Baixar Imagem (Ultra HD)",
    "history.hdProOnly": "Disponível apenas no Plano Pro",
    "history.refine": "Refinar",
    "history.error": "Erro",
    
    // Tokens Page
    "tokens.title": "Compre",
    "tokens.titleHighlight": "Tokens",
    "tokens.description": "Cada renderização consome 1 token. Escolha o pacote ideal para suas necessidades.",
    "tokens.currentBalance": "Saldo atual:",
    "tokens.package": "Pacote",
    "tokens.popular": "Mais Popular",
    "tokens.perToken": "por token",
    "tokens.renders": "renderizações",
    "tokens.highQuality": "Alta qualidade",
    "tokens.noExpiration": "Sem expiração",
    "tokens.buyNow": "Comprar Agora",
    "tokens.note": "💡 Nota: Este é um sistema de demonstração. Nenhum pagamento real é processado.",
    
    // Adjust Dialog (Image Adjustments)
    "adjust.title": "Ajustar Imagem",
    "adjust.description": "Use os controles abaixo para ajustar cor, brilho, contraste e iluminação",
    "adjust.saturation": "🎨 Saturação (Cor)",
    "adjust.brightness": "🔆 Brilho",
    "adjust.contrast": "⚖️ Contraste",
    "adjust.lighting": "💡 Iluminação",
    "adjust.cancel": "Cancelar",
    "adjust.reset": "Resetar",
    "adjust.apply": "Aplicar Ajustes",
    "adjust.applying": "Aplicando...",
    "adjust.success": "Ajustes aplicados! Acompanhe o progresso no histórico.",
    "adjust.error": "Erro ao aplicar ajustes",
    
    // Authentication
    "auth.loginTitle": "Faça login para continuar",
    "auth.loginWithGoogle": "Continuar com Google",
    "auth.or": "ou",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.login": "Entrar",
    "auth.loading": "Carregando...",
    "auth.forgotPassword": "Esqueceu a senha?",
    "auth.noAccount": "Não tem uma conta?",
    "auth.signup": "Cadastre-se",
    "auth.loginSuccess": "Login realizado com sucesso!",
    "auth.loginError": "Erro ao fazer login. Tente novamente.",
    
    "auth.signupTitle": "Crie sua conta",
    "auth.signupWithGoogle": "Cadastrar com Google",
    "auth.name": "Nome",
    "auth.namePlaceholder": "Seu nome completo",
    "auth.confirmPassword": "Confirmar Senha",
    "auth.passwordRequirement": "Mínimo de 6 caracteres",
    "auth.hasAccount": "Já tem uma conta?",
    "auth.termsAgreement": "Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.",
    "auth.signupSuccess": "Conta criada com sucesso!",
    "auth.signupError": "Erro ao criar conta. Tente novamente.",
    "auth.passwordMismatch": "As senhas não coincidem",
    "auth.passwordTooShort": "A senha deve ter no mínimo 6 caracteres",
    
    "auth.forgotPasswordTitle": "Recuperar Senha",
    "auth.forgotPasswordDescription": "Digite seu email e enviaremos um link para redefinir sua senha.",
    "auth.sendResetLink": "Enviar Link de Recuperação",
    "auth.forgotPasswordSuccess": "Email enviado com sucesso!",
    "auth.forgotPasswordError": "Erro ao enviar email. Tente novamente.",
    "auth.resetEmailSent": "Email de recuperação enviado!",
    "auth.checkInbox": "Verifique sua caixa de entrada e siga as instruções.",
    "auth.backToLogin": "Voltar ao Login",
    
    // CTA Section
    "cta.title": "Comece Gratuitamente Hoje",
    "cta.subtitle": "Cadastre-se agora e ganhe",
    "cta.tokensHighlight": "3 renderizações gratuitas",
    "cta.description": "para testar nossa plataforma. Depois escolha o plano ideal para suas necessidades.",
    "cta.button": "Criar Conta Grátis",
    "header.freeRenders": "renders gratuitos",
    
    // Before/After Slider
    "slider.before": "Antes (2D)",
    "slider.after": "Depois (Renderizado)",
    "slider.instruction": "Arraste o controle para comparar antes e depois",
    "slider.sectionTitle": "Veja a Transformação",
    "slider.sectionSubtitle": "Resultados Reais de Projetos",
    
    // Insufficient Tokens Dialog
    "insufficientTokens.title": "Saldo de Tokens Insuficiente",
    "insufficientTokens.description": "Você precisa de pelo menos 1 token para criar uma renderização.",
    "insufficientTokens.currentBalance": "Saldo atual:",
    "insufficientTokens.message": "Cada renderização consome 1 token. Compre mais tokens para continuar criando renderizações incríveis!",
    "insufficientTokens.cancel": "Cancelar",
    "insufficientTokens.buy": "Comprar Tokens",
    
    // Tokens Page - Additional
    "home.yourBalance": "Seu Saldo",
    "home.buyTokens": "Comprar Tokens",
    "home.choosePackage": "Escolha o pacote ideal para suas necessidades. Quanto maior o pacote, maior o desconto!",
    "home.haveCoupon": "Tem um cupom?",
    "home.couponCode": "Código do cupom",
    "home.apply": "Aplicar",
    "home.couponApplied": "Cupom aplicado!",
    "home.enterCoupon": "Digite um código de cupom",
    "home.authRequired": "Autenticação Necessária",
    "home.loginToBuyTokens": "Faça login para comprar tokens",
    "home.login": "Fazer Login",
    "home.buy": "Comprar",
    "home.processing": "Processando...",
    "home.securePayment": "Pagamento seguro processado pelo Stripe",
    "home.acceptedMethods": "Aceitamos cartão de crédito e Pix",
    "home.save": "Economize",
    "home.mostPopular": "MAIS POPULAR",
    
    // Checkout Success
    "home.paymentSuccess": "Pagamento Confirmado!",
    "home.tokensAdded": "Seus tokens foram adicionados à sua conta",
    "home.currentBalance": "Saldo Atual",
    "home.thankYou": "Obrigado pela sua compra!",
    "home.readyToRender": "Agora você está pronto para criar renderizações incríveis.",
    "home.startRendering": "Começar a Renderizar",
    "home.viewHistory": "Ver Histórico",
    
    // Pricing Page
    "pricing.title": "Escolha Seu Plano",
    "pricing.subtitle": "Renderizações ilimitadas de alta qualidade para profissionais",
    "pricing.period": "/mês",
    "pricing.popular": "MAIS POPULAR",
    "pricing.currentPlan": "Plano Atual",
    "pricing.processing": "Processando...",
    "pricing.questions": "Dúvidas sobre os planos?",
    "pricing.manageSubscription": "Gerenciar Assinatura",
    
    // Pricing - Basic Plan
    "pricing.basic.name": "Basic",
    "pricing.basic.description": "Ideal para freelancers e pequenos projetos",
    "pricing.basic.feature1": "100 renderizações por mês",
    "pricing.basic.feature2": "Qualidade HD (1920x1080)",
    "pricing.basic.feature3": "Tempo de renderização: ~15 segundos",
    "pricing.basic.feature4": "Todos os formatos (JPG, PNG, WebP, AVIF)",
    "pricing.basic.feature5": "Suporte por email",
    "pricing.basic.cta": "Assinar Basic",
    
    // Pricing - Pro Plan
    "pricing.pro.name": "Pro",
    "pricing.pro.description": "Para profissionais que exigem o máximo",
    "pricing.pro.feature1": "170 renderizações por mês",
    "pricing.pro.feature2": "Qualidade Ultra HD (resolução máxima)",
    "pricing.pro.feature3": "Tempo de renderização: ~30 segundos",
    "pricing.pro.feature4": "Download em alta resolução",
    "pricing.pro.feature5": "Todos os formatos (JPG, PNG, WebP, AVIF)",
    "pricing.pro.feature6": "Suporte prioritário",
    "pricing.pro.cta": "Assinar Pro",
    
    // Pricing - Extra Renders
    "pricing.extra.title": "Precisa de Mais Renderizações?",
    "pricing.extra.description": "Compre pacotes extras a qualquer momento",
    "pricing.extra.renders": "20 renderizações extras",
    "pricing.extra.note": "Respeita a qualidade do seu plano atual",
    
    // Subscription Page
    "subscription.title": "Minha Assinatura",
    "subscription.authRequired": "Autenticação Necessária",
    "subscription.authDescription": "Faça login para gerenciar sua assinatura",
    "subscription.login": "Fazer Login",
    "subscription.basicPlan": "Plano Basic",
    "subscription.proPlan": "Plano Pro",
    "subscription.active": "Ativa",
    "subscription.canceled": "Cancelada",
    "subscription.noSubscription": "Sem assinatura ativa",
    "subscription.changePlan": "Mudar Plano",
    
    // Subscription - Usage Stats
    "subscription.monthlyQuota": "Quota Mensal",
    "subscription.rendersPerMonth": "renderizações/mês",
    "subscription.used": "Utilizadas",
    "subscription.remaining": "Disponíveis",
    "subscription.extra": "extras",
    
    // Subscription - Billing
    "subscription.billingInfo": "Informações de Cobrança",
    "subscription.nextBilling": "Próxima cobrança",
    "subscription.willCancelAt": "Assinatura será cancelada em",
    
    // Subscription - Actions
    "subscription.actions": "Ações",
    "subscription.buyExtraTitle": "Comprar Renderizações Extras",
    "subscription.buyExtraDescription": "20 renderizações por R$ 49,90",
    "subscription.buyExtra": "Comprar Extras",
    "subscription.paymentMethod": "Forma de Pagamento",
    "subscription.paymentMethodDescription": "Atualizar cartão e ver histórico",
    "subscription.manage": "Gerenciar",
    "subscription.cancelTitle": "Cancelar Assinatura",
    "subscription.cancelDescription": "Cancela no final do período atual",
    "subscription.cancel": "Cancelar",
    "subscription.cancelConfirm": "Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até o final do período pago.",
    "subscription.reactivateTitle": "Reativar Assinatura",
    "subscription.reactivateDescription": "Continue aproveitando todos os benefícios",
    "subscription.reactivate": "Reativar",
    
    // Subscription - Mutations
    "subscription.cancelSuccess": "Assinatura cancelada com sucesso",
    "subscription.cancelError": "Erro ao cancelar assinatura",
    "subscription.reactivateSuccess": "Assinatura reativada com sucesso",
    "subscription.reactivateError": "Erro ao reativar assinatura",
    "subscription.portalError": "Erro ao abrir portal de pagamento",
    "subscription.buyExtraError": "Erro ao comprar renderizações extras",
  },
  "en": {
    // Header
    "header.hello": "Hello",
    "header.tokens": "tokens",
    "header.buyTokens": "Buy Tokens",
    "header.newRender": "New Render",
    "header.history": "History",
    "header.logout": "Logout",
    "header.login": "Login",
    "header.basicPlan": "Basic",
    "header.proPlan": "Pro",
    "header.viewPlans": "View Plans",
    
    // Home Page
    "home.title": "Arqrender",
    "home.subtitle": "Advanced Architectural Rendering",
    "home.description": "Transform your 2D drawings into photorealistic high-quality renderings in seconds. Perfect for architects, interior designers, and construction professionals.",
    "home.cta": "Start Rendering",
    "home.ctaLogin": "Get Started",
    "home.feature1.title": "Fast",
    "home.feature1.description": "Renderings in 10-30 seconds. No waiting, no hassle.",
    "home.feature2.title": "Realistic",
    "home.feature2.description": "Advanced algorithms that preserve geometry and add realistic lighting automatically.",
    "home.feature3.title": "Professional",
    "home.feature3.description": "Used by architects and designers in over 90 countries.",
    
    // Render Page
    "render.title": "New Rendering",
    "render.authRequired": "Authentication Required",
    "render.authDescription": "You need to be authenticated to create renderings.",
    "render.uploadImage": "Image Upload",
    "render.uploadDescription": "Upload your 2D image (floor plan, sketch, or basic render)",
    "render.selectImage": "Select Image",
    "render.sceneType": "Scene Type",
    "render.interior": "Interior",
    "render.exterior": "Exterior",
    "render.outputFormat": "Output Format",
    "render.prompt": "Description/Instructions (optional)",
    "render.promptPlaceholder": "E.g.: Modern style, natural lighting, neutral colors...",
    "render.promptHelp": "Describe the desired style and atmosphere for the rendering",
    "render.submit": "Start Rendering",
    "render.processing": "Processing...",
    
    // History Page
    "history.title": "Rendering History",
    "history.newRender": "+ New Rendering",
    "history.empty": "No renderings found",
    "history.createFirst": "Create your first rendering",
    "history.status.processing": "Processing",
    "history.status.completed": "Completed",
    "history.status.failed": "Failed",
    "history.download": "Download Image",
    "history.downloadHD": "📥 Download High Resolution (Pro)",
    "history.downloadUltraHD": "📥 Download Image (Ultra HD)",
    "history.hdProOnly": "Available only on Pro Plan",
    "history.refine": "Refine",
    "history.error": "Error",
    
    // Tokens Page
    "tokens.title": "Buy",
    "tokens.titleHighlight": "Tokens",
    "tokens.description": "Each rendering consumes 1 token. Choose the ideal package for your needs.",
    "tokens.currentBalance": "Current balance:",
    "tokens.package": "Package",
    "tokens.popular": "Most Popular",
    "tokens.perToken": "per token",
    "tokens.renders": "renderings",
    "tokens.highQuality": "High quality",
    "tokens.noExpiration": "No expiration",
    "tokens.buyNow": "Buy Now",
    "tokens.note": "💡 Note: This is a demonstration system. No real payment is processed.",
    
    // Adjust Dialog (Image Adjustments)
    "adjust.title": "Adjust Image",
    "adjust.description": "Use the controls below to adjust color, brightness, contrast and lighting",
    "adjust.saturation": "🎨 Saturation (Color)",
    "adjust.brightness": "🔆 Brightness",
    "adjust.contrast": "⚖️ Contrast",
    "adjust.lighting": "💡 Lighting",
    "adjust.cancel": "Cancel",
    "adjust.reset": "Reset",
    "adjust.apply": "Apply Adjustments",
    "adjust.applying": "Applying...",
    "adjust.success": "Adjustments applied! Track progress in history.",
    "adjust.error": "Error applying adjustments",
    
    // Authentication
    "auth.loginTitle": "Sign in to continue",
    "auth.loginWithGoogle": "Continue with Google",
    "auth.or": "or",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.login": "Sign In",
    "auth.loading": "Loading...",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.signup": "Sign Up",
    "auth.loginSuccess": "Login successful!",
    "auth.loginError": "Login error. Please try again.",
    
    "auth.signupTitle": "Create your account",
    "auth.signupWithGoogle": "Sign up with Google",
    "auth.name": "Name",
    "auth.namePlaceholder": "Your full name",
    "auth.confirmPassword": "Confirm Password",
    "auth.passwordRequirement": "Minimum 6 characters",
    "auth.hasAccount": "Already have an account?",
    "auth.termsAgreement": "By signing up, you agree to our Terms of Service and Privacy Policy.",
    "auth.signupSuccess": "Account created successfully!",
    "auth.signupError": "Error creating account. Please try again.",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.passwordTooShort": "Password must be at least 6 characters",
    
    "auth.forgotPasswordTitle": "Reset Password",
    "auth.forgotPasswordDescription": "Enter your email and we'll send you a link to reset your password.",
    "auth.sendResetLink": "Send Reset Link",
    "auth.forgotPasswordSuccess": "Email sent successfully!",
    "auth.forgotPasswordError": "Error sending email. Please try again.",
    "auth.resetEmailSent": "Recovery email sent!",
    "auth.checkInbox": "Check your inbox and follow the instructions.",
    "auth.backToLogin": "Back to Login",
    
    // CTA Section
    "cta.title": "Start Free Today",
    "cta.subtitle": "Sign up now and get",
    "cta.tokensHighlight": "3 free renderings",
    "cta.description": "to test our platform. Then choose the ideal plan for your needs.",
    "cta.button": "Sign Up Free",
    "header.freeRenders": "free renders",
    
    // Before/After Slider
    "slider.before": "Before (2D)",
    "slider.after": "After (Rendered)",
    "slider.instruction": "Drag the slider to compare before and after",
    "slider.sectionTitle": "See the Transformation",
    "slider.sectionSubtitle": "Real Project Results",
    
    // Insufficient Tokens Dialog
    "insufficientTokens.title": "Insufficient Token Balance",
    "insufficientTokens.description": "You need at least 1 token to create a rendering.",
    "insufficientTokens.currentBalance": "Current balance:",
    "insufficientTokens.message": "Each rendering consumes 1 token. Buy more tokens to continue creating amazing renderings!",
    "insufficientTokens.cancel": "Cancel",
    "insufficientTokens.buy": "Buy Tokens",
    
    // Tokens Page - Additional
    "home.yourBalance": "Your Balance",
    "home.buyTokens": "Buy Tokens",
    "home.choosePackage": "Choose the ideal package for your needs. The bigger the package, the bigger the discount!",
    "home.haveCoupon": "Have a coupon?",
    "home.couponCode": "Coupon code",
    "home.apply": "Apply",
    "home.couponApplied": "Coupon applied!",
    "home.enterCoupon": "Enter a coupon code",
    "home.authRequired": "Authentication Required",
    "home.loginToBuyTokens": "Sign in to buy tokens",
    "home.login": "Sign In",
    "home.buy": "Buy",
    "home.processing": "Processing...",
    "home.securePayment": "Secure payment processed by Stripe",
    "home.acceptedMethods": "We accept credit card and Pix",
    "home.save": "Save",
    "home.mostPopular": "MOST POPULAR",
    
    // Checkout Success
    "home.paymentSuccess": "Payment Confirmed!",
    "home.tokensAdded": "Your tokens have been added to your account",
    "home.currentBalance": "Current Balance",
    "home.thankYou": "Thank you for your purchase!",
    "home.readyToRender": "You're now ready to create amazing renderings.",
    "home.startRendering": "Start Rendering",
    "home.viewHistory": "View History",
    
    // Pricing Page
    "pricing.title": "Choose Your Plan",
    "pricing.subtitle": "Unlimited high-quality renderings for professionals",
    "pricing.period": "/month",
    "pricing.popular": "MOST POPULAR",
    "pricing.currentPlan": "Current Plan",
    "pricing.processing": "Processing...",
    "pricing.questions": "Questions about plans?",
    "pricing.manageSubscription": "Manage Subscription",
    
    // Pricing - Basic Plan
    "pricing.basic.name": "Basic",
    "pricing.basic.description": "Perfect for freelancers and small projects",
    "pricing.basic.feature1": "100 renders per month",
    "pricing.basic.feature2": "HD Quality (1920x1080)",
    "pricing.basic.feature3": "Rendering time: ~15 seconds",
    "pricing.basic.feature4": "All formats (JPG, PNG, WebP, AVIF)",
    "pricing.basic.feature5": "Email support",
    "pricing.basic.cta": "Subscribe Basic",
    
    // Pricing - Pro Plan
    "pricing.pro.name": "Pro",
    "pricing.pro.description": "For professionals who demand the best",
    "pricing.pro.feature1": "170 renders per month",
    "pricing.pro.feature2": "Ultra HD Quality (maximum resolution)",
    "pricing.pro.feature3": "Rendering time: ~30 seconds",
    "pricing.pro.feature4": "High resolution download",
    "pricing.pro.feature5": "All formats (JPG, PNG, WebP, AVIF)",
    "pricing.pro.feature6": "Priority support",
    "pricing.pro.cta": "Subscribe Pro",
    
    // Pricing - Extra Renders
    "pricing.extra.title": "Need More Renders?",
    "pricing.extra.description": "Buy extra packs anytime",
    "pricing.extra.renders": "20 extra renders",
    "pricing.extra.note": "Respects your current plan quality",
    
    // Subscription Page
    "subscription.title": "My Subscription",
    "subscription.authRequired": "Authentication Required",
    "subscription.authDescription": "Sign in to manage your subscription",
    "subscription.login": "Sign In",
    "subscription.basicPlan": "Basic Plan",
    "subscription.proPlan": "Pro Plan",
    "subscription.active": "Active",
    "subscription.canceled": "Canceled",
    "subscription.noSubscription": "No active subscription",
    "subscription.changePlan": "Change Plan",
    
    // Subscription - Usage Stats
    "subscription.monthlyQuota": "Monthly Quota",
    "subscription.rendersPerMonth": "renders/month",
    "subscription.used": "Used",
    "subscription.remaining": "Available",
    "subscription.extra": "extra",
    
    // Subscription - Billing
    "subscription.billingInfo": "Billing Information",
    "subscription.nextBilling": "Next billing",
    "subscription.willCancelAt": "Subscription will be canceled on",
    
    // Subscription - Actions
    "subscription.actions": "Actions",
    "subscription.buyExtraTitle": "Buy Extra Renders",
    "subscription.buyExtraDescription": "20 renders for R$ 49.90",
    "subscription.buyExtra": "Buy Extras",
    "subscription.paymentMethod": "Payment Method",
    "subscription.paymentMethodDescription": "Update card and view history",
    "subscription.manage": "Manage",
    "subscription.cancelTitle": "Cancel Subscription",
    "subscription.cancelDescription": "Cancels at the end of current period",
    "subscription.cancel": "Cancel",
    "subscription.cancelConfirm": "Are you sure you want to cancel your subscription? You'll still have access until the end of the paid period.",
    "subscription.reactivateTitle": "Reactivate Subscription",
    "subscription.reactivateDescription": "Continue enjoying all benefits",
    "subscription.reactivate": "Reactivate",
    
    // Subscription - Mutations
    "subscription.cancelSuccess": "Subscription canceled successfully",
    "subscription.cancelError": "Error canceling subscription",
    "subscription.reactivateSuccess": "Subscription reactivated successfully",
    "subscription.reactivateError": "Error reactivating subscription",
    "subscription.portalError": "Error opening payment portal",
    "subscription.buyExtraError": "Error buying extra renders",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations["pt-BR"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

