import React from 'react';

interface Scorer {
  name: string;
  team: string;
  flag: string;
  goals: number;
}

const MOCK_SCORERS: Scorer[] = [
  { name: 'Lionel Messi', team: 'Argentina', flag: 'https://api.promiedos.com.ar/images/team/cdhi/1', goals: 0 },
  { name: 'Kylian Mbappé', team: 'Francia', flag: 'https://api.promiedos.com.ar/images/team/fagb/1', goals: 0 },
  { name: 'Harry Kane', team: 'Inglaterra', flag: 'https://api.promiedos.com.ar/images/team/fafe/1', goals: 0 },
  { name: 'Erling Haaland', team: 'Noruega', flag: 'https://api.promiedos.com.ar/images/team/cdhg/1', goals: 0 },
  { name: 'Vini Jr.', team: 'Brasil', flag: 'https://api.promiedos.com.ar/images/team/cdhj/1', goals: 0 },
];

export const TopScorersTable: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Goleadores</h3>
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">Top 5</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {MOCK_SCORERS.map((scorer, idx) => (
          <div key={scorer.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/80 transition-colors border border-transparent hover:border-border">
            <div className="flex items-center gap-4">
              <span className={`font-bold w-4 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                {idx + 1}
              </span>
              <img src={scorer.flag} alt={scorer.team} className="w-8 h-8 rounded-full object-cover border border-border shadow-sm" />
              <div>
                <p className="font-semibold text-foreground">{scorer.name}</p>
                <p className="text-xs text-muted-foreground">{scorer.team}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-primary">{scorer.goals}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Goles</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
