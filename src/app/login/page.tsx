"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Error al iniciar sesión: " + error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      if (error) {
        alert("Error al crear cuenta: " + error.message);
      } else {
        alert("¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.");
        setIsLogin(true);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="font-black text-4xl tracking-tighter">
            PRODE<span className="text-primary">26</span>
          </h1>
          <p className="text-muted-foreground">La gloria te espera. Ingresa para continuar.</p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Ingresa con tu correo y contraseña para cargar tus pronósticos.'
                : 'Regístrate para participar en el Prode Mundial 2026.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre y Apellido</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Lionel Messi" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="messi@argentina.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  {isLogin && (
                    <a href="#" className="text-xs font-medium text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border/50 focus-visible:ring-primary"
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(130,255,145,0.3)] transition-all">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Entrar al Prode' : 'Registrarme')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? '¿No tenés cuenta? ' : '¿Ya tienes una cuenta? '}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="font-medium text-primary hover:underline"
          >
            {isLogin ? 'Crear cuenta nueva' : 'Inicia Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
