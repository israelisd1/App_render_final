import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_LOGO, APP_TITLE, getLoginUrl } from '@/const';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [authProvider, setAuthProvider] = useState<'manus' | 'nextauth' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const customAuth = useCustomAuth();

  // Detectar sistema de autenticação ativo
  useEffect(() => {
    async function detectAuthProvider() {
      try {
        const response = await fetch('/api/trpc/systemConfig.getAuthProvider');
        const data = await response.json();
        setAuthProvider(data.result.data || 'manus');
      } catch (error) {
        console.error('[Login] Failed to detect auth provider:', error);
        setAuthProvider('manus'); // Fallback para Manus
      }
    }

    detectAuthProvider();
  }, []);

  // Se OAuth Manus estiver ativo, redirecionar
  useEffect(() => {
    if (authProvider === 'manus') {
      window.location.href = getLoginUrl();
    }
  }, [authProvider]);

  // Se já estiver logado, redirecionar
  useEffect(() => {
    if (customAuth.isAuthenticated) {
      window.location.href = '/';
    }
  }, [customAuth.isAuthenticated]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      await customAuth.login(email, password);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  }



  // Mostrar loading enquanto detecta o sistema
  if (authProvider === null || customAuth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Se OAuth Manus, não renderizar nada (vai redirecionar)
  if (authProvider === 'manus') {
    return null;
  }

  // NextAuth customizado - mostrar formulário
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl text-amber-900">Entrar no {APP_TITLE}</CardTitle>
          <CardDescription className="text-amber-700">
            Acesse sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Formulário Email/Senha */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-amber-700">
            Não tem uma conta?{' '}
            <Link href="/signup" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

