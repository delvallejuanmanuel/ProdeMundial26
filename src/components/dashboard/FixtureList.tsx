"use client";

import React, { useState } from 'react';
import { MatchCard } from './MatchCard';
import { Filter } from 'lucide-react';

interface Match {
  id: number;
  kickoff_time: string;
  status: 'pending' | 'in_play' | 'finished';
  phase: string;
  home_score: number | null;
  away_score: number | null;
  home_team: { name: string; flag: string } | null;
  away_team: { name: string; flag: string } | null;
}

interface Prediction {
  match_id: number;
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  awarded_points: number | null;
}

interface FixtureListProps {
  matches: Match[];
  predictions: Prediction[];
  userId: string;
  hasPaidGroups: boolean;
  hasPaidKnockouts: boolean;
}

export function FixtureList({
  matches,
  predictions,
  userId,
  hasPaidGroups,
  hasPaidKnockouts
}: FixtureListProps) {
  const [filter, setFilter] = useState<'all' | 'groups' | 'knockouts' | string>('all');

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'groups') return match.phase.toLowerCase().startsWith('grupo');
    if (filter === 'knockouts') return !match.phase.toLowerCase().startsWith('grupo');
    // For specific groups (e.g. "Grupo A")
    return match.phase.toLowerCase() === filter.toLowerCase();
  });

  const groups = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E', 'Grupo F', 'Grupo G', 'Grupo H', 'Grupo I', 'Grupo J', 'Grupo K', 'Grupo L'];

  return (
    <div className="space-y-6">
      
      {/* Filter Controls */}
      <div className="bg-card border border-border/50 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm">
          <Filter className="w-4 h-4" /> Filtros
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('groups')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === 'groups' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Fase de Grupos
          </button>
          <button 
            onClick={() => setFilter('knockouts')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === 'knockouts' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          >
            Eliminatorias
          </button>
        </div>

        {/* Group Selector Dropdown */}
        <select 
          value={groups.includes(filter) ? filter : ''}
          onChange={(e) => {
            if (e.target.value) setFilter(e.target.value);
            else setFilter('all');
          }}
          className="bg-background border border-border/50 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="">Seleccionar Grupo...</option>
          {groups.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Mostrando {filteredMatches.length} partido(s)
      </div>

      {/* Match Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => {
            const date = new Date(match.kickoff_time);
            const userPrediction = predictions.find(p => p.match_id === match.id);
            const isGroupStage = match.phase.toLowerCase().startsWith('grupo');
            const canPlayMatch = isGroupStage ? hasPaidGroups : hasPaidKnockouts;
            
            return (
              <MatchCard 
                key={match.id}
                matchId={match.id}
                homeTeam={match.home_team?.name || 'Por definir'} 
                awayTeam={match.away_team?.name || 'Por definir'} 
                homeFlag={match.home_team?.flag || '❓'} 
                awayFlag={match.away_team?.flag || '❓'} 
                matchDate={date.toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: 'short' })} 
                matchTime={date.toLocaleTimeString('es-AR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' })} 
                groupName={match.phase.toUpperCase()} 
                status={match.status} 
                userId={userId}
                hasPaid={canPlayMatch}
                actualHomeScore={match.home_score}
                actualAwayScore={match.away_score}
                awardedPoints={userPrediction?.awarded_points}
                initialHomeScore={userPrediction?.predicted_home_score}
                initialAwayScore={userPrediction?.predicted_away_score}
                kickoffTime={match.kickoff_time}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-xl">
            No hay partidos para mostrar con este filtro.
          </div>
        )}
      </div>
    </div>
  );
}
