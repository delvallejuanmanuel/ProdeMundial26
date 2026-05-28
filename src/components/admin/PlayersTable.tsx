"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';

export function PlayersTable() {
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supabase = createClient();

  const fetchPlayers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select(`
        id,
        name,
        goals,
        teams (name, flag)
      `)
      .order('goals', { ascending: false })
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching players:', error);
    } else {
      setPlayers(data || []);
      setFilteredPlayers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlayers(players);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredPlayers(
        players.filter(p => 
          p.name.toLowerCase().includes(lower) || 
          p.teams?.name?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTerm, players]);

  const handleUpdateGoals = async (playerId: number, currentGoals: number, change: number) => {
    const newGoals = Math.max(0, currentGoals + change);
    if (newGoals === currentGoals) return;

    setSavingId(playerId);
    
    // Optimistic UI update
    setPlayers(players.map(p => p.id === playerId ? { ...p, goals: newGoals } : p));

    try {
      const { updatePlayerGoalsAction } = await import('@/app/admin/actions');
      await updatePlayerGoalsAction(playerId, newGoals);
    } catch (error: any) {
      alert("Error al actualizar goles: " + error.message);
      // Revert on error
      fetchPlayers();
    }
    setSavingId(null);
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-card p-4 rounded-xl border border-border/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-bold">Goleadores del Torneo</h3>
          <p className="text-sm text-muted-foreground">Gestiona los goles de cada jugador. Esto impacta en la tabla principal de Goleadores.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar jugador o país..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-secondary-foreground font-bold border-b border-border/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-12 text-center">ID</th>
                <th className="px-4 py-3">Jugador</th>
                <th className="px-4 py-3">Selección</th>
                <th className="px-4 py-3 text-center">Goles</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length > 0 ? filteredPlayers.map(player => (
                <tr key={player.id} className="border-b border-border/20 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-center">{player.id}</td>
                  <td className="px-4 py-3 font-bold text-base">{player.name}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    {player.teams?.flag && <img src={player.teams.flag} alt={player.teams.name} className="w-6 h-6 object-cover rounded-sm border border-border/50" />}
                    {player.teams?.name}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="w-8 h-8 rounded-full"
                        onClick={() => handleUpdateGoals(player.id, player.goals || 0, -1)}
                        disabled={savingId === player.id || !player.goals}
                      >
                        -
                      </Button>
                      <span className="text-xl font-black min-w-[2rem]">{player.goals || 0}</span>
                      <Button 
                        size="icon" 
                        variant="default"
                        className="w-8 h-8 rounded-full"
                        onClick={() => handleUpdateGoals(player.id, player.goals || 0, 1)}
                        disabled={savingId === player.id}
                      >
                        {savingId === player.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '+'}
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">No se encontraron jugadores.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
