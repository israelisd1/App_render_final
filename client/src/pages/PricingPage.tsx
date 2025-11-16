import { useAuth } from "@/_core/hooks/useAuth";
import { useLoginUrl } from "@/components/LoginButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function PricingPage() {
  const loginUrl = useLoginUrl();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Buscar price IDs do backend
  const { data: prices } = trpc.subscription.prices.useQuery();

  const createSubscriptionMutation = trpc.subscription.create.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Redirecionar para Stripe Checkout
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(`Erro ao criar assinatura: ${error.message}`);
    },
  });

  const handleSubscribe = (plan: 'basic' | 'pro') => {
    if (!isAuthenticated) {
      window.location.href = loginUrl;
      return;
    }

    if (!prices) {
      toast.error('Erro: Carregando informações de preço...');
      return;
    }

    // Mapear plan para priceId
    const priceId = plan === 'basic' ? prices.basic : prices.pro;

    if (!priceId) {
      toast.error('Erro: Price ID não configurado');
      return;
    }

    createSubscriptionMutation.mutate({ priceId });
  };

  const plans = [
    {
      id: 'basic',
      name: t('pricing.basic.name'),
      price: 'R$ 99,90',
      period: t('pricing.period'),
      description: t('pricing.basic.description'),
      features: [
        t('pricing.basic.feature1'),
        t('pricing.basic.feature2'),
        t('pricing.basic.feature3'),
        t('pricing.basic.feature4'),
        t('pricing.basic.feature5'),
      ],
      cta: t('pricing.basic.cta'),
      popular: false,
      icon: Zap,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      price: 'R$ 149,90',
      period: t('pricing.period'),
      description: t('pricing.pro.description'),
      features: [
        t('pricing.pro.feature1'),
        t('pricing.pro.feature2'),
        t('pricing.pro.feature3'),
        t('pricing.pro.feature4'),
        t('pricing.pro.feature5'),
        t('pricing.pro.feature6'),
      ],
      cta: t('pricing.pro.cta'),
      popular: true,
      icon: Sparkles,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-amber-900 mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-amber-700 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = user?.plan === plan.id;
              
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden bg-white/90 border-2 transition-all hover:shadow-2xl ${
                    plan.popular
                      ? 'border-orange-400 shadow-xl scale-105'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                      {t('pricing.popular')}
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-10">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-amber-900">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-amber-700 mt-2">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-5xl font-bold text-amber-900">
                        {plan.price}
                      </span>
                      <span className="text-amber-700 ml-2">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-8">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-800">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="px-6 pb-6">
                    {isCurrentPlan ? (
                      <Button
                        disabled
                        className="w-full bg-gray-400 text-white cursor-not-allowed"
                      >
                        {t('pricing.currentPlan')}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe(plan.id as 'basic' | 'pro')}
                        disabled={createSubscriptionMutation.isPending}
                        className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white font-semibold py-6 text-lg transition-all`}
                      >
                        {createSubscriptionMutation.isPending
                          ? t('pricing.processing')
                          : plan.cta}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Extra Renders Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="bg-white/90 border-amber-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-amber-900">
                  {t('pricing.extra.title')}
                </CardTitle>
                <CardDescription className="text-amber-700">
                  {t('pricing.extra.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6 border-2 border-amber-300">
                  <p className="text-4xl font-bold text-amber-900 mb-2">
                    R$ 49,90
                  </p>
                  <p className="text-amber-700">
                    {t('pricing.extra.renders')}
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    {t('pricing.extra.note')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-amber-700 mb-4">
              {t('pricing.questions')}
            </p>
            <Button
              variant="outline"
              onClick={() => setLocation('/subscription')}
              className="border-amber-300 text-amber-900 hover:bg-amber-50"
            >
              {t('pricing.manageSubscription')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

