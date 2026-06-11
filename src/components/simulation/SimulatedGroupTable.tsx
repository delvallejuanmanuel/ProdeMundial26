import React from 'react';
import { SimulatedGroup } from '@/utils/simulation';

interface Props {
  group: SimulatedGroup;
  qualifyingThirdIds: number[];
}

export function SimulatedGroupTable({ group, qualifyingThirdIds }: Props) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden flex flex-col shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted/40 text-muted-foreground text-xs font-semibold border-b border-border">
          <tr>
            <th className="px-3 py-2.5 font-bold text-foreground text-sm normal-case">{group.group_name}</th>
            <th className="px-2 py-2.5 text-center" title="Partidos Jugados">PJ</th>
            <th className="px-2 py-2.5 text-center" title="Ganados">G</th>
            <th className="px-2 py-2.5 text-center" title="Empatados">E</th>
            <th className="px-2 py-2.5 text-center" title="Perdidos">P</th>
            <th className="px-2 py-2.5 text-center" title="Diferencia de Goles">DG</th>
            <th className="px-3 py-2.5 text-center text-foreground">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((team, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;
            const isQualifyingThird = isThird && qualifyingThirdIds.includes(team.team_id);

            let rowBg = 'bg-card';
            let leftBorderClass = '';

            if (isFirst || isSecond) {
              rowBg = 'bg-primary/5';
              leftBorderClass = 'border-l-2 border-l-primary';
            } else if (isQualifyingThird) {
              rowBg = 'bg-amber-500/5';
              leftBorderClass = 'border-l-2 border-l-amber-500';
            }

            return (
              <tr
                key={team.team_id}
                className={`border-b border-border/40 hover:bg-muted/40 transition-colors ${rowBg} ${leftBorderClass}`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium w-3 text-right text-xs">{idx + 1}</span>
                    <img
                      src={team.flag}
                      alt={team.name}
                      className="w-5 h-5 object-contain rounded-sm drop-shadow-sm"
                    />
                    <span
                      className="font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[90px] md:max-w-[120px] text-xs"
                      title={team.name}
                    >
                      {team.name}
                    </span>
                    {(isFirst || isSecond) && (
                      <span className="text-[9px] font-black text-primary bg-primary/10 px-1 rounded leading-tight shrink-0">
                        ✓
                      </span>
                    )}
                    {isQualifyingThird && (
                      <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-1 rounded leading-tight shrink-0">
                        3°
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">{team.played}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">{team.won}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">{team.drawn}</td>
                <td className="px-2 py-2.5 text-center text-muted-foreground text-xs">{team.lost}</td>
                <td className={`px-2 py-2.5 text-center text-xs font-medium ${team.goal_diff > 0 ? 'text-primary' : team.goal_diff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                </td>
                <td className="px-3 py-2.5 text-center font-black text-foreground text-sm">{team.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
