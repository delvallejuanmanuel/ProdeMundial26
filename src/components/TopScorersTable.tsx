import React from 'react';
import { createClient } from '@/utils/supabase/server';

export const TopScorersTable = async () => {
  const supabase = await createClient();

  const { data: players, error } = await supabase
    .from('players')
    .select(`
      id,
      name,
      goals,
      teams!inner (
        name,
        flag
      )
    `)
    .order('goals', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching top scorers:', error);
    return null;
  }

  // Si no hay goles todavía, podemos mostrar un estado vacío o los primeros jugadores con 0 goles
  const scorers = players || [];

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Goleadores</h3>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">Top 5</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {scorers.length > 0 ? scorers.map((scorer: any, idx: number) => (
          <div key={scorer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors border border-transparent hover:border-border">
            <div className="flex items-center gap-4">
              <span className={`font-bold w-4 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {idx + 1}
              </span>
              <img src={scorer.teams?.flag} alt={scorer.teams?.name} className="w-8 h-8 rounded-full object-cover border border-border shadow-sm" />
              <div>
                <p className="font-semibold text-foreground">{scorer.name}</p>
                <p className="text-xs text-muted-foreground">{scorer.teams?.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-primary">{scorer.goals}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Goles</span>
            </div>
          </div>
        )) : (
          <div className="text-center text-sm text-muted-foreground py-4 border border-dashed border-border/50 rounded-lg">
            Aún no hay goleadores registrados.
          </div>
        )}
      </div>
    </div>
  );
};

