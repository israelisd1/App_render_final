import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_LOGO, APP_TITLE } from '@/const';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [authProvider, setAuthProvider] = useState<'manus' | 'nextauth' | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Detectar sistema de autenticação ativo
  useEffect(() => {
    async function detectAuthProvider() {
      try {
        const response = await fetch('/api/trpc/systemConfig.getAuthProvider');
        const data = await response.json();
        setAuthProvider(data.result.data || 'manus');
      } catch (error) {
        console.error('[ForgotPassword] Failed to detect auth provider:', error);
        setAuthProvider('manus');
      }
    }

    detectAuthProvider();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      toast.error('Digite seu email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar email');
      }

      setEmailSent(true);
      toast.success('Email enviado! Verifique sua caixa de entrada');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email');
    } finally {
      setIsLoading(false);
    }
  }

  // Mostrar loading enquanto detecta o sistema
  if (authProvider === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Se OAuth Manus, mostrar mensagem
  if (authProvider === 'manus') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl text-amber-900">Recuperação de Senha</CardTitle>
            <CardDescription className="text-amber-700">
              Sistema OAuth Manus ativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-amber-800">
              Para recuperar sua senha, acesse o portal de autenticação da Manus.
            </p>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => window.location.href = '/login'}
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // NextAuth customizado - mostrar formulário
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-amber-900">Email Enviado!</CardTitle>
            <CardDescription className="text-amber-700">
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-amber-800">
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
            </p>
            <p className="text-center text-sm text-amber-600">
              Não esqueça de verificar a pasta de spam.
            </p>
            <Link href="/login">
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl text-amber-900">Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-amber-700">
            Digite seu email para receber instruções de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Instruções'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/login">
              <a className="text-sm text-amber-600 hover:text-amber-700 hover:underline inline-flex items-center">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para Login
              </a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

