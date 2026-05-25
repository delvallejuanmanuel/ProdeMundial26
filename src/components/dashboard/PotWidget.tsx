import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, DollarSign } from 'lucide-react';

export function PotWidget() {
  // Mock data for the MVP
  const totalPot = 376000;
  const currentPhase = "Fase de Grupos";
  const phasePrize = 90000;
  const totalParticipants = 10;
  const paidParticipants = 10;

  const progress = (paidParticipants / totalParticipants) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-card to-card/50 border-border/50 shadow-2xl relative overflow-hidden">
      {/* Subtle neon glow effect behind */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>

      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Main Pot */}
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Pozo Acumulado Total
            </h2>
            <div className="text-5xl font-extrabold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-1">
              <span className="text-primary text-3xl">$</span>
              {totalPot.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en {totalParticipants} participantes.
            </p>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-24 bg-border/50"></div>

          {/* Current Phase Prize */}
          <div className="flex-1 space-y-4">
            <div className="bg-background/50 rounded-xl p-4 border border-border/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Premio en Juego</p>
                <p className="text-lg font-bold text-foreground">{currentPhase}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-primary">${phasePrize.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" /> Pagos Confirmados
                </span>
                <span className="text-foreground">{paidParticipants} / {totalParticipants}</span>
              </div>
              <Progress value={progress} className="h-2 bg-secondary" />
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
