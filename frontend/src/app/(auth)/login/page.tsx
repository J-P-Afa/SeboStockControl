'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card';
import { useAuth } from '@/hooks/use-auth';
import { getErrorMessage } from '@/lib/api';
import { loginSchema, type LoginFormData } from '@/lib/validations/login.schema';

const MIN_LOADING_MS = 600;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const showLoading = isSubmitting || isLoggingIn;

  async function onSubmit(data: LoginFormData) {
    setError(null);
    setIsLoggingIn(true);
    const start = Date.now();
    try {
      await login(data);
      router.push('/users');
    } catch (err) {
      const message = getErrorMessage(err, 'Email ou senha inválidos');
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 relative overflow-hidden noise-bg">
      {/* Elementos decorativos de fundo para ressaltar o glassmorphism */}
      <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-secondary/10 blur-[120px] animate-pulse" />
      
      <Card
        className={`w-full max-w-sm glass-darker border-none shadow-[0_0_50px_oklch(var(--primary)/0.1)] relative z-10 rounded-3xl ${error ? 'animate-shake' : ''}`}
      >
        <CardHeader className="text-center pt-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30 text-primary-foreground transform transition-transform hover:scale-110">
            <BookOpen className="h-8 w-8" />
          </div>
          <CardTitle className="text-4xl font-display font-bold tracking-tight">Sebo Stock</CardTitle>
          <CardDescription className="text-muted-foreground/60 mt-2 text-base">Entre com suas credenciais para continuar</CardDescription>
        </CardHeader>
        <CardContent className="pb-10 pt-4">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {error && (
              <div
                role="alert"
                className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-2"
              >
                {error}
              </div>
            )}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-foreground/70 font-medium ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@admin.com"
                autoComplete="email"
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 italic ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-foreground/70 font-medium ml-1">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-11"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 italic ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="hero" className="w-full h-12 text-lg font-bold" disabled={showLoading}>
              {showLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

}
