import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, DollarSign } from 'lucide-react';

interface PotWidgetProps {
  totalGroupsPaid?: number;
  totalKnockoutsPaid?: number;
  totalGlobalOnlyPaid?: number;
}

export function PotWidget({ totalGroupsPaid = 0, totalKnockoutsPaid = 0, totalGlobalOnlyPaid = 0 }: PotWidgetProps) {
  const PHASE_PRICE = 20000;
  
  const groupsPot = totalGroupsPaid * PHASE_PRICE;
  const knockoutsPot = totalKnockoutsPaid * PHASE_PRICE;
  const latePot = totalGlobalOnlyPaid * PHASE_PRICE;
  
  const originalPot = groupsPot + knockoutsPot;
  
  const currentPhase = "Fase de Grupos";
  const phasePrize = originalPot * 0.30; // 30% of original pot goes to Group Phase winner
  const globalPrize = (originalPot * 0.70) + latePot; // 70% of original + 100% of late goes to Global winner
  const totalPaid = Math.max(totalGroupsPaid, totalKnockoutsPaid) + totalGlobalOnlyPaid; // Approximation of unique users

  return (
    <Card className="w-full bg-gradient-to-br from-card to-card/50 border-border/50 shadow-2xl relative overflow-hidden h-full">
      {/* Subtle neon glow effect behind */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>

      <CardContent className="p-6 h-full flex flex-col justify-center">
        <div className="flex flex-col gap-6">
          
          {/* Main Pot */}
          <div className="space-y-2 text-center">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Pozo Acumulado
            </h2>
            <div className="text-4xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-1">
              <span className="text-primary text-2xl">$</span>
              {(originalPot + latePot).toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Basado en {totalPaid} pagos confirmados.
            </p>
          </div>

          <div className="w-full h-px bg-border/50"></div>

          {/* Prize Distribution */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-background/50 rounded-xl p-3 border border-border/50 text-center flex flex-col justify-center">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Premio x Fecha (10%)</p>
                <p className="text-xl font-black text-primary">${(phasePrize / 3).toLocaleString('es-AR')}</p>
                <p className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">Fechas 1, 2 y 3</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3 border border-primary/20 text-center relative overflow-hidden flex flex-col justify-center gap-1">
                <div className="absolute inset-0 bg-primary/5"></div>
                <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-wider relative">Premio Global (70%)</p>
                <p className="text-xl font-black text-primary relative">${globalPrize.toLocaleString('es-AR')}</p>
                <div className="w-full h-px bg-primary/10 relative my-0.5"></div>
                <div className="text-[9px] text-muted-foreground relative flex flex-col gap-0.5">
                  <div className="flex justify-between px-1">
                    <span>1° (70%):</span>
                    <span className="font-bold text-foreground">${(globalPrize * 0.7).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between px-1">
                    <span>2° (30%):</span>
                    <span className="font-bold text-foreground">${(globalPrize * 0.3).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Pagos F. Grupos
                </span>
                <span className="text-foreground">{totalGroupsPaid}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Pagos Eliminatorias
                </span>
                <span className="text-foreground">{totalKnockoutsPaid}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Pagos Tardíos (Global)
                </span>
                <span className="text-foreground">{totalGlobalOnlyPaid}</span>
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
