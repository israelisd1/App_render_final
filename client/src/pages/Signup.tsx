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

export default function Signup() {
  const [authProvider, setAuthProvider] = useState<'manus' | 'nextauth' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        console.error('[Signup] Failed to detect auth provider:', error);
        setAuthProvider('manus');
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

    if (!name || !email || !cpf || !password || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    // Validar formato do CPF (apenas números, 11 dígitos)
    const cpfClean = cpf.replace(/[^\d]/g, '');
    if (cpfClean.length !== 11) {
      toast.error('CPF deve ter 11 dígitos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      await customAuth.signup(email, password, cpf, name);
      
      // Enviar email de verificação
      try {
        await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        
        toast.success('Conta criada! Verifique seu email para ativar sua conta.', {
          duration: 10000,
        });
      } catch (verifyError) {
        console.error('[Signup] Failed to send verification email:', verifyError);
        toast.success('Conta criada com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
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
          <CardTitle className="text-2xl text-amber-900">Criar Conta</CardTitle>
          <CardDescription className="text-amber-700">
            Cadastre-se para começar a usar o {APP_TITLE}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Formulário de Cadastro */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

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
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => {
                  // Máscara de CPF
                  let value = e.target.value.replace(/[^\d]/g, '');
                  if (value.length > 11) value = value.slice(0, 11);
                  if (value.length > 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
                  } else if (value.length > 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                  } else if (value.length > 3) {
                    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
                  }
                  setCpf(value);
                }}
                disabled={isLoading}
                required
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-amber-700">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-700 hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

