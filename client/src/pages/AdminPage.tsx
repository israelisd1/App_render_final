import { useAuth } from "@/_core/hooks/useAuth";
import { useLoginUrl } from "@/components/LoginButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Users, Coins, TrendingUp, FileText, DollarSign, Shield, AlertTriangle, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminPage() {
  const loginUrl = useLoginUrl();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.email === 'israelisd@gmail.com',
  });

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.users.useQuery(undefined, {
    enabled: isAuthenticated && user?.email === 'israelisd@gmail.com',
  });

  // Estado para edição de renderizações
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ monthlyQuota: number; extraRenders: number }>({
    monthlyQuota: 0,
    extraRenders: 0,
  });

  const updateRendersMutation = trpc.admin.updateUserRenders.useMutation({
    onSuccess: () => {
      toast.success('Renderizações atualizadas com sucesso!');
      setEditingUser(null);
      refetchUsers();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleEdit = (userId: number, monthlyQuota: number, extraRenders: number) => {
    setEditingUser(userId);
    setEditValues({ monthlyQuota, extraRenders });
  };

  const handleSave = async (userId: number) => {
    await updateRendersMutation.mutateAsync({
      userId,
      monthlyQuota: editValues.monthlyQuota,
      extraRenders: editValues.extraRenders,
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  // Auth Provider Management
  const { data: authProviderData, refetch: refetchAuthProvider } = trpc.systemConfig.getAuthProvider.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const setAuthProviderMutation = trpc.systemConfig.setAuthProvider.useMutation({
    onSuccess: () => {
      toast.success('Sistema de autenticação alterado com sucesso!');
      refetchAuthProvider();
    },
    onError: (error) => {
      toast.error(`Erro ao alterar sistema: ${error.message}`);
    },
  });

  const [isChangingAuth, setIsChangingAuth] = useState(false);

  const handleAuthProviderChange = async (provider: 'manus' | 'nextauth') => {
    if (confirm(`Tem certeza que deseja alternar para ${provider === 'manus' ? 'OAuth Manus' : 'NextAuth'}?\n\nEsta ação é reversível a qualquer momento.`)) {
      setIsChangingAuth(true);
      try {
        await setAuthProviderMutation.mutateAsync({ provider });
      } finally {
        setIsChangingAuth(false);
      }
    }
  };

  // Verificar se o usuário tem permissão
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Autenticação Necessária</CardTitle>
            <CardDescription className="text-amber-700">
              Você precisa estar autenticado para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
              <a href={loginUrl}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.email !== 'israelisd@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Acesso Negado</CardTitle>
            <CardDescription className="text-amber-700">
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Painel Administrativo</h1>
          <p className="text-amber-700">Visão geral do sistema e gerenciamento de usuários</p>
        </div>

        {/* Auth Provider Selection Card */}
        <Card className="mb-8 bg-white/90 backdrop-blur border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900">Sistema de Autenticação</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Escolha qual sistema de autenticação será usado na aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => handleAuthProviderChange('manus')}
                  disabled={isChangingAuth || authProviderData?.provider === 'manus'}
                  variant={authProviderData?.provider === 'manus' ? 'default' : 'outline'}
                  className={authProviderData?.provider === 'manus' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600' 
                    : 'border-amber-300 text-amber-900 hover:bg-amber-50'}
                >
                  {authProviderData?.provider === 'manus' && '✓ '}
                  OAuth Manus (Simples)
                </Button>
                <Button
                  onClick={() => handleAuthProviderChange('nextauth')}
                  disabled={isChangingAuth || authProviderData?.provider === 'nextauth'}
                  variant={authProviderData?.provider === 'nextauth' ? 'default' : 'outline'}
                  className={authProviderData?.provider === 'nextauth' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600' 
                    : 'border-amber-300 text-amber-900 hover:bg-amber-50'}
                >
                  {authProviderData?.provider === 'nextauth' && '✓ '}
                  NextAuth (Completo)
                </Button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Sistema atual: {authProviderData?.provider === 'manus' ? 'OAuth Manus' : 'NextAuth'}</p>
                    <p className="mb-2">
                      <strong>OAuth Manus:</strong> Login único via Manus (mais simples, ideal para apps internos)
                      <br />
                      <strong>NextAuth:</strong> Login com Google, Email/Senha, recuperação de senha (completo)
                    </p>
                    <p className="text-xs text-amber-700">
                      <strong>Atenção:</strong> A mudança é instantânea (cache de 5s). Usuários logados podem precisar fazer logout/login após a troca.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Gerais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <Card className="bg-white/90 backdrop-blur border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {statsLoading ? "..." : stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Tokens Comprados</CardTitle>
              <Coins className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {statsLoading ? "..." : stats?.totalTokensPurchased || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Tokens Utilizados</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {statsLoading ? "..." : stats?.totalTokensUsed || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Renderizações</CardTitle>
              <FileText className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {statsLoading ? "..." : stats?.totalRenders || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {statsLoading ? "..." : `R$ ${((stats?.totalRevenue || 0) / 100).toFixed(2)}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        <Card className="bg-white/90 backdrop-blur border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">Usuários Cadastrados</CardTitle>
            <CardDescription className="text-amber-700">
              Lista completa de usuários e suas renderizações (clique para editar)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8 text-amber-700">Carregando...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-amber-900">ID</TableHead>
                      <TableHead className="text-amber-900">Nome</TableHead>
                      <TableHead className="text-amber-900">E-mail</TableHead>
                      <TableHead className="text-amber-900">Plano</TableHead>
                      <TableHead className="text-amber-900 text-right">Quota Mensal</TableHead>
                      <TableHead className="text-amber-900 text-right">Usadas no Mês</TableHead>
                      <TableHead className="text-amber-900 text-right">Extras</TableHead>
                      <TableHead className="text-amber-900 text-right">Disponíveis</TableHead>
                      <TableHead className="text-amber-900 text-right">Total Renders</TableHead>
                      <TableHead className="text-amber-900 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-amber-900 font-medium">{u.id}</TableCell>
                        <TableCell className="text-amber-900">{u.name || "-"}</TableCell>
                        <TableCell className="text-amber-900">{u.email || "-"}</TableCell>
                        <TableCell className="text-amber-900">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.plan === 'pro' ? 'bg-purple-100 text-purple-800' :
                            u.plan === 'basic' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {u.plan?.toUpperCase() || 'FREE'}
                          </span>
                        </TableCell>
                        <TableCell className="text-amber-900 text-right">
                          {editingUser === u.id ? (
                            <Input
                              type="number"
                              min="0"
                              value={editValues.monthlyQuota}
                              onChange={(e) => setEditValues({ ...editValues, monthlyQuota: parseInt(e.target.value) || 0 })}
                              className="w-20 text-right"
                            />
                          ) : (
                            u.monthlyQuota || 0
                          )}
                        </TableCell>
                        <TableCell className="text-amber-900 text-right">
                          {u.monthlyRendersUsed || 0}
                        </TableCell>
                        <TableCell className="text-amber-900 text-right">
                          {editingUser === u.id ? (
                            <Input
                              type="number"
                              min="0"
                              value={editValues.extraRenders}
                              onChange={(e) => setEditValues({ ...editValues, extraRenders: parseInt(e.target.value) || 0 })}
                              className="w-20 text-right"
                            />
                          ) : (
                            u.extraRenders || 0
                          )}
                        </TableCell>
                        <TableCell className="text-amber-900 text-right font-bold">
                          {u.totalAvailable || 0}
                        </TableCell>
                        <TableCell className="text-amber-900 text-right">
                          {u.totalRendersCount || 0}
                        </TableCell>
                        <TableCell className="text-center">
                          {editingUser === u.id ? (
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                onClick={() => handleSave(u.id)}
                                disabled={updateRendersMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateRendersMutation.isPending}
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(u.id, u.monthlyQuota || 0, u.extraRenders || 0)}
                              className="border-amber-300 text-amber-900 hover:bg-amber-50"
                            >
                              Editar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

