import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { APP_TITLE } from '@/const';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado');
      return;
    }

    // Verificar email
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verificado com sucesso!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Erro ao verificar email');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Erro ao verificar email');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-amber-900">
            Verificação de Email
          </CardTitle>
          <CardDescription className="text-amber-700">
            {APP_TITLE}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
              <p className="text-center text-gray-600">
                Verificando seu email...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-green-700">
                  {message}
                </p>
                <p className="text-gray-600">
                  Você já pode fazer login na sua conta.
                </p>
              </div>
              <Button
                onClick={() => setLocation('/login')}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                Ir para Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-red-700">
                  {message}
                </p>
                <p className="text-gray-600">
                  O link pode ter expirado ou já foi utilizado.
                </p>
              </div>
              <Button
                onClick={() => setLocation('/signup')}
                variant="outline"
                className="w-full"
              >
                Voltar para Cadastro
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

