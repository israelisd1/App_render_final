import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminCouponsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateCodeForm, setShowCreateCodeForm] = useState(false);

  // Form states
  const [couponId, setCouponId] = useState("");
  const [couponName, setCouponName] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [duration, setDuration] = useState<"once" | "repeating" | "forever">("once");
  const [durationMonths, setDurationMonths] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [selectedCouponId, setSelectedCouponId] = useState("");
  const [promoMaxRedemptions, setPromoMaxRedemptions] = useState("");

  // Queries
  const { data: coupons, isLoading: couponsLoading, refetch: refetchCoupons } = trpc.admin.coupons.list.useQuery();
  const { data: promoCodes, isLoading: promoCodesLoading, refetch: refetchPromoCodes } = trpc.admin.promotionCodes.list.useQuery();

  // Mutations
  const createCouponMutation = trpc.admin.coupons.create.useMutation({
    onSuccess: () => {
      toast.success("Cupom criado com sucesso!");
      refetchCoupons();
      resetCouponForm();
      setShowCreateForm(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar cupom: ${error.message}`);
    },
  });

  const deleteCouponMutation = trpc.admin.coupons.delete.useMutation({
    onSuccess: () => {
      toast.success("Cupom deletado com sucesso!");
      refetchCoupons();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar cupom: ${error.message}`);
    },
  });

  const createPromoCodeMutation = trpc.admin.promotionCodes.create.useMutation({
    onSuccess: () => {
      toast.success("Código promocional criado com sucesso!");
      refetchPromoCodes();
      resetPromoCodeForm();
      setShowCreateCodeForm(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar código: ${error.message}`);
    },
  });

  const deactivatePromoCodeMutation = trpc.admin.promotionCodes.deactivate.useMutation({
    onSuccess: () => {
      toast.success("Código promocional desativado!");
      refetchPromoCodes();
    },
    onError: (error) => {
      toast.error(`Erro ao desativar código: ${error.message}`);
    },
  });

  const resetCouponForm = () => {
    setCouponId("");
    setCouponName("");
    setDiscountValue("");
    setDuration("once");
    setDurationMonths("");
    setMaxRedemptions("");
  };

  const resetPromoCodeForm = () => {
    setPromoCode("");
    setSelectedCouponId("");
    setPromoMaxRedemptions("");
  };

  const handleCreateCoupon = () => {
    if (!couponId || !discountValue) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Valor de desconto inválido");
      return;
    }

    createCouponMutation.mutate({
      id: couponId,
      name: couponName || undefined,
      percentOff: discountType === "percent" ? value : undefined,
      amountOff: discountType === "amount" ? value : undefined,
      currency: "brl",
      duration,
      durationInMonths: duration === "repeating" && durationMonths ? parseInt(durationMonths) : undefined,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : undefined,
    });
  };

  const handleCreatePromoCode = () => {
    if (!promoCode || !selectedCouponId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createPromoCodeMutation.mutate({
      code: promoCode,
      couponId: selectedCouponId,
      maxRedemptions: promoMaxRedemptions ? parseInt(promoMaxRedemptions) : undefined,
    });
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm(`Tem certeza que deseja deletar o cupom ${id}?`)) {
      deleteCouponMutation.mutate({ id });
    }
  };

  const handleDeactivatePromoCode = (id: string, code: string) => {
    if (confirm(`Tem certeza que deseja desativar o código ${code}?`)) {
      deactivatePromoCodeMutation.mutate({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Cupons</h1>
              <p className="text-gray-600 mt-1">Crie e gerencie cupons de desconto e códigos promocionais</p>
            </div>
          </div>

          {/* Cupons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cupons</CardTitle>
                  <CardDescription>Lista de cupons de desconto criados</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  {showCreateForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {showCreateForm ? "Cancelar" : "Novo Cupom"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCreateForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="couponId">ID do Cupom *</Label>
                      <Input
                        id="couponId"
                        value={couponId}
                        onChange={(e) => setCouponId(e.target.value)}
                        placeholder="PRIMEIRACOMPRA"
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="couponName">Nome (opcional)</Label>
                      <Input
                        id="couponName"
                        value={couponName}
                        onChange={(e) => setCouponName(e.target.value)}
                        placeholder="Primeira Compra"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discountType">Tipo de Desconto</Label>
                      <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentual (%)</SelectItem>
                          <SelectItem value="amount">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discountValue">Valor do Desconto *</Label>
                      <Input
                        id="discountValue"
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder={discountType === "percent" ? "10" : "50.00"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duração</Label>
                      <Select value={duration} onValueChange={(v: any) => setDuration(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Uma vez</SelectItem>
                          <SelectItem value="repeating">Repetir por X meses</SelectItem>
                          <SelectItem value="forever">Para sempre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {duration === "repeating" && (
                      <div>
                        <Label htmlFor="durationMonths">Número de Meses</Label>
                        <Input
                          id="durationMonths"
                          type="number"
                          value={durationMonths}
                          onChange={(e) => setDurationMonths(e.target.value)}
                          placeholder="3"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="maxRedemptions">Limite de Usos (opcional)</Label>
                      <Input
                        id="maxRedemptions"
                        type="number"
                        value={maxRedemptions}
                        onChange={(e) => setMaxRedemptions(e.target.value)}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateCoupon}
                    disabled={createCouponMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                  >
                    {createCouponMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Criar Cupom
                  </Button>
                </div>
              )}

              {couponsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !coupons || coupons.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum cupom criado ainda</p>
              ) : (
                <div className="space-y-3">
                  {coupons.map((coupon: any) => (
                    <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg">{coupon.id}</span>
                          {coupon.name && <span className="text-gray-600">- {coupon.name}</span>}
                          {!coupon.valid && <Badge variant="destructive">Inválido</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>
                            {coupon.percentOff ? `${coupon.percentOff}% OFF` : `R$ ${coupon.amountOff} OFF`}
                          </span>
                          <span>•</span>
                          <span>
                            {coupon.duration === "once" && "Uma vez"}
                            {coupon.duration === "repeating" && `${coupon.durationInMonths} meses`}
                            {coupon.duration === "forever" && "Para sempre"}
                          </span>
                          {coupon.maxRedemptions && (
                            <>
                              <span>•</span>
                              <span>{coupon.timesRedeemed}/{coupon.maxRedemptions} usos</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        disabled={deleteCouponMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Códigos Promocionais */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Códigos Promocionais</CardTitle>
                  <CardDescription>Códigos que os usuários podem usar no checkout</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateCodeForm(!showCreateCodeForm)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  {showCreateCodeForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {showCreateCodeForm ? "Cancelar" : "Novo Código"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showCreateCodeForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="promoCode">Código Promocional *</Label>
                      <Input
                        id="promoCode"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="BEMVINDO10"
                        className="uppercase"
                      />
                    </div>
                    <div>
                      <Label htmlFor="selectedCouponId">Cupom Vinculado *</Label>
                      <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cupom" />
                        </SelectTrigger>
                        <SelectContent>
                          {coupons?.map((coupon: any) => (
                            <SelectItem key={coupon.id} value={coupon.id}>
                              {coupon.id} - {coupon.percentOff ? `${coupon.percentOff}%` : `R$ ${coupon.amountOff}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="promoMaxRedemptions">Limite de Usos (opcional)</Label>
                    <Input
                      id="promoMaxRedemptions"
                      type="number"
                      value={promoMaxRedemptions}
                      onChange={(e) => setPromoMaxRedemptions(e.target.value)}
                      placeholder="50"
                    />
                  </div>

                  <Button
                    onClick={handleCreatePromoCode}
                    disabled={createPromoCodeMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                  >
                    {createPromoCodeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Criar Código
                  </Button>
                </div>
              )}

              {promoCodesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !promoCodes || promoCodes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum código promocional criado ainda</p>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map((code: any) => (
                    <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-lg">{code.code}</span>
                          {!code.active && <Badge variant="destructive">Inativo</Badge>}
                          {code.active && <Badge variant="default">Ativo</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Cupom: {code.couponId}</span>
                          {code.percentOff && (
                            <>
                              <span>•</span>
                              <span>{code.percentOff}% OFF</span>
                            </>
                          )}
                          {code.amountOff && (
                            <>
                              <span>•</span>
                              <span>R$ {code.amountOff} OFF</span>
                            </>
                          )}
                          {code.maxRedemptions && (
                            <>
                              <span>•</span>
                              <span>{code.timesRedeemed}/{code.maxRedemptions} usos</span>
                            </>
                          )}
                        </div>
                      </div>
                      {code.active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivatePromoCode(code.id, code.code)}
                          disabled={deactivatePromoCodeMutation.isPending}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
