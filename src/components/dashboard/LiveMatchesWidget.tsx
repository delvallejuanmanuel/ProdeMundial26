'use client';

import React from 'react';

interface LiveMatchesWidgetProps {
  liveMatches: any[];
  predictions: any[];
}

export function LiveMatchesWidget({ liveMatches, predictions }: LiveMatchesWidgetProps) {
  if (!liveMatches || liveMatches.length === 0) {
    return null; // Do not render anything if there are no live matches
  }

  return (
    <div className="mt-4 bg-background border border-red-500/30 rounded-xl overflow-hidden shadow-sm shadow-red-900/20">
      <div className="bg-red-500/10 px-4 py-3 border-b border-red-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h3 className="font-bold text-red-500 tracking-tight text-sm uppercase">Partidos en Vivo</h3>
        </div>
        <div className="text-[10px] text-muted-foreground uppercase font-semibold">
          Puntos Virtuales Activos
        </div>
      </div>
      
      <div className="divide-y divide-border/50">
        {liveMatches.map((match) => {
          const userPrediction = predictions.find(p => p.match_id === match.id);
          const points = userPrediction?.awarded_points || 0;
          
          let pointsColor = "text-muted-foreground";
          let pointsBg = "bg-muted/10";
          if (points === 5) {
            pointsColor = "text-green-500";
            pointsBg = "bg-green-500/10";
          } else if (points === 3) {
            pointsColor = "text-yellow-500";
            pointsBg = "bg-yellow-500/10";
          } else if (points === 1) {
            pointsColor = "text-blue-500";
            pointsBg = "bg-blue-500/10";
          }

          return (
            <div key={match.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/5 transition-colors">
              
              {/* Match Result */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col items-center gap-1 w-20">
                  <img src={match.home_team?.flag} alt={match.home_team?.name} className="w-8 h-8 object-cover rounded-full border border-border/50" />
                  <span className="text-xs font-semibold truncate w-full text-center">{match.home_team?.name}</span>
                </div>
                
                <div className="flex items-center justify-center gap-2 px-3 py-1 bg-background border border-border/50 rounded-lg shadow-inner">
                  <span className="text-xl font-black">{match.home_score !== null ? match.home_score : '-'}</span>
                  <span className="text-xs text-muted-foreground font-bold">vs</span>
                  <span className="text-xl font-black">{match.away_score !== null ? match.away_score : '-'}</span>
                </div>

                <div className="flex flex-col items-center gap-1 w-20">
                  <img src={match.away_team?.flag} alt={match.away_team?.name} className="w-8 h-8 object-cover rounded-full border border-border/50" />
                  <span className="text-xs font-semibold truncate w-full text-center">{match.away_team?.name}</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-12 bg-border/50"></div>

              {/* User Prediction & Points */}
              <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
                <div className="flex flex-col items-start sm:items-end">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Tu Pronóstico</span>
                  {userPrediction && userPrediction.predicted_home_score !== null ? (
                    <div className="flex items-center gap-2 font-mono bg-muted/20 px-2 py-1 rounded">
                      <span className="font-bold">{userPrediction.predicted_home_score}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="font-bold">{userPrediction.predicted_away_score}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No cargado</span>
                  )}
                </div>

                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-border/50 ${pointsBg}`}>
                  <span className={`text-2xl font-black ${pointsColor}`}>+{points}</span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Pts</span>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
