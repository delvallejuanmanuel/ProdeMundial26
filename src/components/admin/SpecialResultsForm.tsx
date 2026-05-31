"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Trophy, Target, HeartCrack, Loader2, Star } from 'lucide-react';

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

export function SpecialResultsForm() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [champion, setChampion] = useState<string>('');
  const [runnerUp, setRunnerUp] = useState<string>('');
  const [topScorer, setTopScorer] = useState<string>('');
  const [disappointment, setDisappointment] = useState<string>('');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const [{ data: teamsData }, { data: playersData }] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name')
      ]);
      if (teamsData) setTeams(teamsData);
      if (playersData) setPlayers(playersData);
    };
    fetchData();
  }, []);

  const handleCalculate = async () => {
    if (!champion || !runnerUp || !topScorer || !disappointment) {
      alert("Debes seleccionar a todos los ganadores reales antes de calcular.");
      return;
    }

    if (!confirm('🚨 ATENCIÓN: Esta acción repartirá los puntos especiales a todos los usuarios y modificará drásticamente la tabla de posiciones. ¿Estás seguro?')) {
      return;
    }

    setIsCalculating(true);
    setCalcResult(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc('calculate_special_points', {
      actual_champion_id: parseInt(champion),
      actual_runner_up_id: parseInt(runnerUp),
      actual_top_scorer_id: parseInt(topScorer),
      actual_disappointment_id: parseInt(disappointment)
    });

    setIsCalculating(false);

    if (error) {
      setCalcResult(`❌ Error: ${error.message}`);
    } else {
      setCalcResult(`✅ ¡Éxito! Se evaluaron ${data?.predictions_evaluated ?? 0} pronósticos especiales.`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Star className="w-6 h-6 text-primary" /> Resultados Reales
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Al finalizar el Mundial, selecciona quiénes fueron los ganadores reales para repartir los puntos extra a los usuarios.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Campeón */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Campeón Real
            </label>
            <select 
              value={champion}
              onChange={(e) => setChampion(e.target.value)}
              className="w-full bg-card text-card-foreground border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="" className="bg-card text-card-foreground">Seleccionar...</option>
              {teams.map(t => <option key={t.id} value={t.id} className="bg-card text-card-foreground">{t.name}</option>)}
            </select>
          </div>

          {/* Subcampeón */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2 text-gray-400">
              <Trophy className="w-4 h-4" /> Subcampeón Real
            </label>
            <select 
              value={runnerUp}
              onChange={(e) => setRunnerUp(e.target.value)}
              className="w-full bg-card text-card-foreground border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="" className="bg-card text-card-foreground">Seleccionar...</option>
              {teams.map(t => <option key={t.id} value={t.id} className="bg-card text-card-foreground">{t.name}</option>)}
            </select>
          </div>

          {/* Goleador */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" /> Goleador Real
            </label>
            <select 
              value={topScorer}
              onChange={(e) => setTopScorer(e.target.value)}
              className="w-full bg-card text-card-foreground border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="" className="bg-card text-card-foreground">Seleccionar...</option>
              {players.map(p => <option key={p.id} value={p.id} className="bg-card text-card-foreground">{p.name}</option>)}
            </select>
          </div>

          {/* Decepción */}
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <HeartCrack className="w-4 h-4 text-red-500" /> Decepción Real
            </label>
            <select 
              value={disappointment}
              onChange={(e) => setDisappointment(e.target.value)}
              className="w-full bg-card text-card-foreground border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="" className="bg-card text-card-foreground">Seleccionar...</option>
              {teams.map(t => <option key={t.id} value={t.id} className="bg-card text-card-foreground">{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="border-t border-border/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground max-w-sm">
            Esto sumará +10 (Campeón), +5 (Subcampeón), +7 (Goleador) y +5 (Decepción) a los usuarios que hayan acertado.
          </div>
          <Button 
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full md:w-auto font-bold bg-primary text-primary-foreground shadow-[0_0_15px_rgba(130,255,145,0.3)] hover:scale-105 transition-all"
          >
            {isCalculating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : 'Calcular Especiales Definitivos'}
          </Button>
        </div>

        {calcResult && (
          <div className="mt-6 p-4 bg-muted/50 rounded-xl font-medium text-center border border-border/50 animate-in fade-in">
            {calcResult}
          </div>
        )}
      </div>
    </div>
  );
}
