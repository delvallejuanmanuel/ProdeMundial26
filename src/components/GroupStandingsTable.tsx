import React from 'react';

export interface GroupData {
  name: string;
  teams: {
    pos: number;
    flag: string;
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalDiff: number;
    points: number;
  }[];
}

interface GroupStandingsTableProps {
  group: GroupData;
}

export const GroupStandingsTable: React.FC<GroupStandingsTableProps> = ({ group }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-semibold border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-800 text-base normal-case">{group.name}</th>
            <th className="px-2 py-3 text-center" title="Partidos Jugados">PJ</th>
            <th className="px-2 py-3 text-center" title="Partidos Ganados">G</th>
            <th className="px-2 py-3 text-center" title="Partidos Empatados">E</th>
            <th className="px-2 py-3 text-center" title="Partidos Perdidos">P</th>
            <th className="px-2 py-3 text-center" title="Diferencia de Goles">DG</th>
            <th className="px-3 py-3 text-center text-gray-700">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((team, idx) => (
            <tr key={team.name} className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors ${idx < 2 ? 'bg-white' : 'bg-gray-50/30'}`}>
              <td className="px-4 py-3 flex items-center gap-3">
                <span className="text-gray-400 font-medium w-3 text-right">{team.pos}</span>
                <img src={team.flag} alt={`${team.name} flag`} className="w-6 h-6 object-contain drop-shadow-sm rounded-sm" />
                <span className="font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{team.name}</span>
              </td>
              <td className="px-2 py-3 text-center text-gray-600">{team.played}</td>
              <td className="px-2 py-3 text-center text-gray-600">{team.won}</td>
              <td className="px-2 py-3 text-center text-gray-600">{team.drawn}</td>
              <td className="px-2 py-3 text-center text-gray-600">{team.lost}</td>
              <td className="px-2 py-3 text-center text-gray-600">{team.goalDiff}</td>
              <td className="px-3 py-3 text-center font-bold text-gray-800">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
