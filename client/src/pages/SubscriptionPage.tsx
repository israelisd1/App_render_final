import { useAuth } from "@/_core/hooks/useAuth";
import { useLoginUrl } from "@/components/LoginButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Calendar, CheckCircle, CreditCard, Loader2, Sparkles, XCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import Header from "@/components/Header";

export default function SubscriptionPage() {
  const loginUrl = useLoginUrl();
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: subscriptionStatus, isLoading: statusLoading } = trpc.subscription.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cancelMutation = trpc.subscription.cancel.useMutation({
    onSuccess: () => {
      toast.success(t('subscription.cancelSuccess'));
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`${t('subscription.cancelError')}: ${error.message}`);
    },
  });

  const reactivateMutation = trpc.subscription.reactivate.useMutation({
    onSuccess: () => {
      toast.success(t('subscription.reactivateSuccess'));
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`${t('subscription.reactivateError')}: ${error.message}`);
    },
  });

  const portalMutation = trpc.subscription.portal.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(`${t('subscription.portalError')}: ${error.message}`);
    },
  });

  const buyExtraMutation = trpc.subscription.buyExtra.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(`${t('subscription.buyExtraError')}: ${error.message}`);
    },
  });

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-white/90 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">{t('subscription.authRequired')}</CardTitle>
            <CardDescription className="text-amber-700">{t('subscription.authDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
              <a href={loginUrl}>{t('subscription.login')}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  const planIcon = user?.plan === 'pro' ? Sparkles : Zap;
  const PlanIcon = planIcon;
  const planColor = user?.plan === 'pro' ? 'from-orange-500 to-red-500' : 'from-amber-500 to-orange-500';
  const planName = user?.plan === 'pro' ? t('subscription.proPlan') : t('subscription.basicPlan');

  const renderQuota = subscriptionStatus?.monthlyQuota || 0;
  const renderUsed = subscriptionStatus?.monthlyRendersUsed || 0;
  const renderRemaining = renderQuota - renderUsed;
  const extraRenders = subscriptionStatus?.extraRenders || 0;
  const quotaPercentage = renderQuota > 0 ? (renderUsed / renderQuota) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-amber-900 mb-8">{t('subscription.title')}</h1>

          {/* Current Plan Card */}
          <Card className="bg-white/90 border-amber-200 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${planColor} flex items-center justify-center`}>
                    <PlanIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-amber-900">{planName}</CardTitle>
                    <CardDescription className="text-amber-700">
                      {subscriptionStatus?.subscriptionStatus === 'active' && (
                        <span className="flex items-center gap-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {t('subscription.active')}
                        </span>
                      )}
                      {subscriptionStatus?.subscriptionStatus === 'canceled' && (
                        <span className="flex items-center gap-2 mt-1">
                          <XCircle className="h-4 w-4 text-red-600" />
                          {t('subscription.canceled')}
                        </span>
                      )}
                      {!subscriptionStatus?.subscriptionStatus && (
                        <span className="flex items-center gap-2 mt-1">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          {t('subscription.noSubscription')}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setLocation('/pricing')}
                  className="border-amber-300 text-amber-900 hover:bg-amber-50"
                >
                  {t('subscription.changePlan')}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Usage Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/90 border-amber-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-amber-700">{t('subscription.monthlyQuota')}</CardDescription>
                <CardTitle className="text-3xl text-amber-900">{renderQuota}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-600">{t('subscription.rendersPerMonth')}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-amber-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-amber-700">{t('subscription.used')}</CardDescription>
                <CardTitle className="text-3xl text-amber-900">{renderUsed}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-amber-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-amber-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-amber-700">{t('subscription.remaining')}</CardDescription>
                <CardTitle className="text-3xl text-amber-900">{renderRemaining + extraRenders}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-600">
                  {extraRenders > 0 && `(+${extraRenders} ${t('subscription.extra')})`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Billing Info */}
          {subscriptionStatus?.billingPeriodEnd && (
            <Card className="bg-white/90 border-amber-200 mb-8">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('subscription.billingInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800">
                  {t('subscription.nextBilling')}: {new Date(subscriptionStatus.billingPeriodEnd).toLocaleDateString('pt-BR')}
                </p>                {subscriptionStatus?.subscriptionStatus === 'canceled' && (
                  <p className="text-red-600 mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t('subscription.willCancelAt')} {new Date(subscriptionStatus.billingPeriodEnd).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="bg-white/90 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">{t('subscription.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buy Extra Renders */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <h3 className="font-semibold text-amber-900">{t('subscription.buyExtraTitle')}</h3>
                  <p className="text-sm text-amber-700">{t('subscription.buyExtraDescription')}</p>
                </div>
                <Button
                  onClick={() => buyExtraMutation.mutate({ quantity: 20 })}
                  disabled={buyExtraMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {buyExtraMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('subscription.buyExtra')
                  )}
                </Button>
              </div>

              {/* Manage Payment Method */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div>
                  <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('subscription.paymentMethod')}
                  </h3>
                  <p className="text-sm text-amber-700">{t('subscription.paymentMethodDescription')}</p>
                </div>
                <Button
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  variant="outline"
                  className="border-amber-300 text-amber-900 hover:bg-amber-50"
                >
                  {portalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('subscription.manage')
                  )}
                </Button>
              </div>

              {/* Cancel/Reactivate Subscription */}
                {subscriptionStatus?.subscriptionStatus === 'active' && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="font-semibold text-red-900">{t('subscription.cancelTitle')}</h3>
                    <p className="text-sm text-red-700">{t('subscription.cancelDescription')}</p>
                  </div>
                  <Button
                    onClick={() => {
                      if (confirm(t('subscription.cancelConfirm'))) {
                        cancelMutation.mutate();
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    variant="outline"
                    className="border-red-300 text-red-900 hover:bg-red-50"
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('subscription.cancel')
                    )}
                  </Button>
                </div>
              )}

                  {subscriptionStatus?.subscriptionStatus === 'canceled' && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h3 className="font-semibold text-green-900">{t('subscription.reactivateTitle')}</h3>
                    <p className="text-sm text-green-700">{t('subscription.reactivateDescription')}</p>
                  </div>
                  <Button
                    onClick={() => reactivateMutation.mutate()}
                    disabled={reactivateMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    {reactivateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('subscription.reactivate')
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

