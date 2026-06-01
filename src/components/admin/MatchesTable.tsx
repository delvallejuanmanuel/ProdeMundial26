"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export function MatchesTable() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const supabase = createClient();

  const fetchMatches = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        kickoff_time,
        status,
        phase,
        home_score,
        away_score,
        home_team_id,
        away_team_id,
        winner_by_penalties_team_id,
        home_team:teams!home_team_id (name, flag),
        away_team:teams!away_team_id (name, flag)
      `)
      .order('kickoff_time', { ascending: true });
    
    if (error) {
      console.error(error);
    } else {
      setMatches(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleUpdateMatch = async (matchId: number, field: string, value: any) => {
    setMatches(matches.map(m => m.id === matchId ? { ...m, [field]: value } : m));
  };

  const handleSaveMatch = async (match: any) => {
    const isPlayoff = !match.phase.toLowerCase().startsWith('grupo');
    const isTie = match.home_score !== '' && match.away_score !== '' && Number(match.home_score) === Number(match.away_score);
    if (isPlayoff && isTie && !match.winner_by_penalties_team_id) {
      alert("Para empates en playoffs, debes indicar qué equipo ganó por penales.");
      return;
    }

    setSavingId(match.id);
    try {
      const { updateMatchAction } = await import('@/app/admin/actions');
      await updateMatchAction(
        match.id, 
        match.status, 
        match.home_score === '' ? null : Number(match.home_score), 
        match.away_score === '' ? null : Number(match.away_score),
        isPlayoff && isTie ? Number(match.winner_by_penalties_team_id) : null
      );
    } catch (error: any) {
      alert("Error al actualizar partido: " + error.message);
    }
    setSavingId(null);
  };

  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const handleCalculatePoints = async () => {
    if (!confirm('¿Estás seguro? Esto recalculará los puntajes de TODOS los pronósticos de partidos finalizados.')) return;
    
    setIsCalculating(true);
    setCalcResult(null);
    
    const { data, error } = await supabase.rpc('calculate_points');
    
    setIsCalculating(false);
    
    if (error) {
      setCalcResult(`❌ Error: ${error.message}`);
    } else {
      setCalcResult(`✅ Listo. Se evaluaron ${data?.predictions_evaluated ?? 0} pronósticos.`);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredMatches = matches.filter(match => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (match.home_team?.name && match.home_team.name.toLowerCase().includes(lower)) ||
      (match.away_team?.name && match.away_team.name.toLowerCase().includes(lower)) ||
      (match.phase && match.phase.toLowerCase().includes(lower))
    );
  });

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-card p-4 rounded-xl border border-border/50 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold">Calculadora de Puntajes</h3>
            <p className="text-sm text-muted-foreground">Ejecuta esto después de finalizar un partido para repartir los puntos.</p>
          </div>
          <Button onClick={handleCalculatePoints} disabled={isCalculating} variant="secondary" className="font-bold border-border/50 shrink-0">
            {isCalculating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Calculando...</> : 'Calcular Puntajes Ahora'}
          </Button>
        </div>
        {calcResult && (
          <div className="text-sm font-medium p-2 rounded-lg bg-muted/50">{calcResult}</div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-border/20 pt-4">
          <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
            <span><strong className="text-primary">5 pts</strong> = Resultado exacto</span>
            <span><strong className="text-primary">3 pts</strong> = Diferencia de goles</span>
            <span><strong className="text-primary">1 pt</strong> = Acertar ganador/empate</span>
          </div>
          
          <div className="relative w-full md:w-72 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <Input 
              placeholder="Buscar equipo o fase..." 
              className="pl-9 bg-background/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-secondary-foreground font-bold border-b border-border/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Fase / Fecha</th>
                <th className="px-4 py-3 text-right">Local</th>
                <th className="px-4 py-3 text-center">Goles</th>
                <th className="px-4 py-3">Visitante</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.length > 0 ? filteredMatches.map(match => {
                const date = new Date(match.kickoff_time);
                const isPlayoff = !match.phase.toLowerCase().startsWith('grupo');
                const isTie = match.home_score !== '' && match.away_score !== '' && Number(match.home_score) === Number(match.away_score);
                return (
                  <tr key={match.id} className="border-b border-border/20 hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold">{match.phase}</div>
                      <div className="text-xs text-muted-foreground">{date.toLocaleDateString('es-AR', { timeZone: 'UTC' })} {date.toLocaleTimeString('es-AR', { timeZone: 'UTC', hour: '2-digit', minute:'2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {match.home_team?.name || 'TBD'}
                        {match.home_team?.flag && (
                          match.home_team.flag.startsWith('http') 
                            ? <img src={match.home_team.flag} alt={match.home_team.name || ''} className="w-6 h-6 object-cover rounded-sm border border-border/50" />
                            : <span>{match.home_team.flag}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-2">
                          <Input 
                            type="number" 
                            min="0"
                            className="w-16 text-center" 
                            value={match.home_score ?? ''} 
                            onChange={(e) => {
                              handleUpdateMatch(match.id, 'home_score', e.target.value);
                              if (e.target.value !== match.away_score) {
                                handleUpdateMatch(match.id, 'winner_by_penalties_team_id', null);
                              }
                            }}
                          />
                          <span>-</span>
                          <Input 
                            type="number" 
                            min="0"
                            className="w-16 text-center" 
                            value={match.away_score ?? ''} 
                            onChange={(e) => {
                              handleUpdateMatch(match.id, 'away_score', e.target.value);
                              if (e.target.value !== match.home_score) {
                                handleUpdateMatch(match.id, 'winner_by_penalties_team_id', null);
                              }
                            }}
                          />
                        </div>
                        
                        {isPlayoff && isTie && (
                          <select
                            value={match.winner_by_penalties_team_id ?? ''}
                            onChange={(e) => handleUpdateMatch(match.id, 'winner_by_penalties_team_id', e.target.value ? Number(e.target.value) : null)}
                            className="bg-background text-foreground border border-border/50 rounded px-1.5 py-0.5 text-xs outline-none focus:ring-1 focus:ring-primary mt-1 w-32"
                          >
                            <option value="">Ganador Penales...</option>
                            <option value={match.home_team_id}>{match.home_team?.name || 'Local'}</option>
                            <option value={match.away_team_id}>{match.away_team?.name || 'Visitante'}</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center justify-start gap-2">
                        {match.away_team?.flag && (
                          match.away_team.flag.startsWith('http') 
                            ? <img src={match.away_team.flag} alt={match.away_team.name || ''} className="w-6 h-6 object-cover rounded-sm border border-border/50" />
                            : <span>{match.away_team.flag}</span>
                        )}
                        {match.away_team?.name || 'TBD'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        className="bg-card text-card-foreground border border-border/50 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-primary w-full"
                        value={match.status}
                        onChange={(e) => handleUpdateMatch(match.id, 'status', e.target.value)}
                      >
                        <option value="pending" className="bg-card text-card-foreground">Pendiente</option>
                        <option value="in_play" className="bg-card text-card-foreground">En Vivo</option>
                        <option value="finished" className="bg-card text-card-foreground">Finalizado</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveMatch(match)}
                        disabled={savingId === match.id}
                      >
                        {savingId === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                      </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron partidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
