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
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Goleadores</h3>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Top 5</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {MOCK_SCORERS.map((scorer, idx) => (
          <div key={scorer.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <span className={`font-bold w-4 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                {idx + 1}
              </span>
              <img src={scorer.flag} alt={scorer.team} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm" />
              <div>
                <p className="font-semibold text-gray-800">{scorer.name}</p>
                <p className="text-xs text-gray-500">{scorer.team}</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-black text-blue-900">{scorer.goals}</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Goles</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
