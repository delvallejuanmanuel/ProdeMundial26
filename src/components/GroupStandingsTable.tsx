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
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border overflow-hidden flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg duration-300">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold border-b border-border">
          <tr>
            <th className="px-3 py-3 font-semibold text-foreground text-base normal-case">{group.name}</th>
            <th className="px-2 py-3 text-center" title="Partidos Jugados">PJ</th>
            <th className="px-2 py-3 text-center" title="Partidos Ganados">G</th>
            <th className="px-2 py-3 text-center" title="Partidos Empatados">E</th>
            <th className="px-2 py-3 text-center" title="Partidos Perdidos">P</th>
            <th className="px-2 py-3 text-center" title="Diferencia de Goles">DG</th>
            <th className="px-3 py-3 text-center text-foreground">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((team, idx) => (
            <tr key={team.name} className={`border-b border-border/50 hover:bg-muted/80 transition-colors ${idx < 2 ? 'bg-card' : 'bg-muted/30'}`}>
              <td className="px-3 py-3 flex items-center gap-2">
                <span className="text-muted-foreground font-medium w-3 text-right">{team.pos}</span>
                <img src={team.flag} alt={`${team.name} flag`} className="w-6 h-6 object-contain drop-shadow-sm rounded-sm" />
                <span className="font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] md:max-w-[120px]" title={team.name}>{team.name}</span>
              </td>
              <td className="px-2 py-3 text-center text-muted-foreground">{team.played}</td>
              <td className="px-2 py-3 text-center text-muted-foreground">{team.won}</td>
              <td className="px-2 py-3 text-center text-muted-foreground">{team.drawn}</td>
              <td className="px-2 py-3 text-center text-muted-foreground">{team.lost}</td>
              <td className="px-2 py-3 text-center text-muted-foreground">{team.goalDiff}</td>
              <td className="px-3 py-3 text-center font-bold text-foreground">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
