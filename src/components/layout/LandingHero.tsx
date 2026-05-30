import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, ShieldCheck, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden flex-1 flex flex-col justify-center items-center text-center px-4 py-24 min-h-[80vh]">
        
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 -z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-md text-sm font-semibold text-primary mb-4">
            <Trophy className="w-4 h-4" />
            <span>Mundial 2026 - Norteamérica</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            EL PRODE <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-400">
              DEFINITIVO
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Demuestra tus conocimientos futbolísticos, compite contra tus amigos y llévate el premio mayor. Pronostica cada partido, adivina el campeón y suma puntos en cada fase.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(130,255,145,0.3)] transition-all hover:scale-105 rounded-xl w-full sm:w-auto">
                Ingresar / Registrarse
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-border/50 hover:bg-secondary/50 backdrop-blur-md rounded-xl w-full sm:w-auto">
                Ver Posiciones
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/50 border-t border-border/50 py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            
            <div className="space-y-4 text-center md:text-left">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 border border-primary/20">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Acierta y Suma</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gana 3 puntos por resultado exacto, 2 por diferencia de goles o 1 por acertar el ganador. Cada detalle cuenta para llegar a la cima.
              </p>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 border border-blue-500/20">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Pronósticos Especiales</h3>
              <p className="text-muted-foreground leading-relaxed">
                Juega tus fichas antes de que empiece el mundial. Adivina el campeón, subcampeón y goleador para un boost masivo de puntos al final.
              </p>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto md:mx-0 border border-purple-500/20">
                <Users className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold">Pronostica la Gloria</h3>
              <p className="text-muted-foreground leading-relaxed">
                Mira como la tabla de posiciones se actualiza al instante con cada gol. La gloria y el premio mayor esperan al mejor estratega.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
