"use client";

import React, { useState } from 'react';
import { Trophy, Star, Target, HeartCrack, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Badge } from '@/components/ui/badge';

interface Team {
  id: number;
  name: string;
  flag: string;
}

interface Player {
  id: number;
  name: string;
  team_id: number | null;
}

interface SpecialPrediction {
  champion_team_id: number | null;
  runner_up_team_id: number | null;
  top_scorer_player_id: number | null;
  suggested_top_scorer: string | null;
}

interface SpecialPredictionsFormProps {
  teams: Team[];
  players: Player[];
  initialPrediction: SpecialPrediction | null;
  userId: string;
  hasPaid: boolean;
  isLocked?: boolean;
}

export function SpecialPredictionsForm({
  teams,
  players,
  initialPrediction,
  userId,
  hasPaid,
  isLocked = false
}: SpecialPredictionsFormProps) {
  const [champion, setChampion] = useState<string>(initialPrediction?.champion_team_id?.toString() || '');
  const [runnerUp, setRunnerUp] = useState<string>(initialPrediction?.runner_up_team_id?.toString() || '');
  const [topScorer, setTopScorer] = useState<string>(
    initialPrediction?.top_scorer_player_id?.toString() || (initialPrediction?.suggested_top_scorer ? 'other' : '')
  );
  const [suggestedScorer, setSuggestedScorer] = useState<string>(initialPrediction?.suggested_top_scorer || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!hasPaid) {
      alert("Debes tener tus pagos validados para cargar pronósticos especiales.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    const supabase = createClient();

    const payload = {
      user_id: userId,
      champion_team_id: champion ? parseInt(champion) : null,
      runner_up_team_id: runnerUp ? parseInt(runnerUp) : null,
      top_scorer_player_id: topScorer && topScorer !== 'other' ? parseInt(topScorer) : null,
      suggested_top_scorer: topScorer === 'other' ? suggestedScorer : null,
    };

    const { error } = await supabase
      .from('special_predictions')
      .upsert(payload, { onConflict: 'user_id' });

    setIsSaving(false);

    if (error) {
      console.error(error);
      alert("Error al guardar pronósticos especiales.");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {isLocked ? (
        <div className="bg-muted/50 border border-border/50 p-4 rounded-xl flex items-center gap-2 font-bold mb-8 text-muted-foreground">
          🔒 El tiempo para cargar pronósticos especiales ha finalizado. El Mundial ya comenzó.
        </div>
      ) : !hasPaid ? (
        <div className="bg-destructive/15 text-destructive border border-destructive/30 p-4 rounded-xl flex items-center gap-2 font-bold mb-8">
          ⚠️ Debes validar el pago de tu inscripción para cargar pronósticos especiales.
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Campeón */}
        <div className={`bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group ${hasPaid ? 'hover:border-primary/50' : 'opacity-80 grayscale-[20%]'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/20"></div>
          <Trophy className="w-8 h-8 text-yellow-500 mb-4" />
          <h3 className="font-bold text-lg mb-1">Campeón del Mundo</h3>
          <p className="text-xs text-muted-foreground mb-4">+10 Puntos</p>
          
          <select 
            disabled={!hasPaid || isSaving || isLocked}
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
          >
            <option value="">Seleccionar Equipo...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Subcampeón */}
        <div className={`bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group ${hasPaid ? 'hover:border-primary/50' : 'opacity-80 grayscale-[20%]'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-400/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-gray-400/20"></div>
          <MedalIcon className="w-8 h-8 text-gray-400 mb-4" />
          <h3 className="font-bold text-lg mb-1">Subcampeón</h3>
          <p className="text-xs text-muted-foreground mb-4">+5 Puntos</p>
          
          <select 
            disabled={!hasPaid || isSaving || isLocked}
            value={runnerUp}
            onChange={(e) => setRunnerUp(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
          >
            <option value="">Seleccionar Equipo...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Goleador */}
        <div className={`bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group ${hasPaid ? 'hover:border-primary/50' : 'opacity-80 grayscale-[20%]'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
          <Target className="w-8 h-8 text-blue-500 mb-4" />
          <h3 className="font-bold text-lg mb-1">Goleador del Torneo</h3>
          <p className="text-xs text-muted-foreground mb-4">+7 Puntos</p>
          
          <select 
            disabled={!hasPaid || isSaving || isLocked}
            value={topScorer}
            onChange={(e) => setTopScorer(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 mb-3"
          >
            <option value="">Seleccionar Jugador...</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="other">Otro jugador (escribir sugerencia)</option>
          </select>

          {topScorer === 'other' && (
            <input 
              type="text"
              disabled={!hasPaid || isSaving || isLocked}
              value={suggestedScorer}
              onChange={(e) => setSuggestedScorer(e.target.value)}
              placeholder="Ej: Erling Haaland"
              className="w-full bg-background border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none disabled:opacity-50 mt-2"
            />
          )}
        </div>
      </div>

      {hasPaid && !isLocked && (
        <div className="flex justify-end pt-6">
          <Button 
            size="lg" 
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className={`px-10 font-bold transition-all shadow-lg ${
              saveSuccess 
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30'
            }`}
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Guardando...</>
            ) : saveSuccess ? (
              <><Check className="w-5 h-5 mr-2" /> Guardado Correctamente</>
            ) : (
              'Guardar Especiales'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function MedalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2h-.5" />
    </svg>
  )
}
