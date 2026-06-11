import React from 'react';
import { GroupStandingsTable, GroupData } from './GroupStandingsTable';
import { createClient } from '@/utils/supabase/server';

export const StandingsBoard = async () => {
  const supabase = await createClient();

  const { data: standingsData, error } = await supabase
    .from('v_group_standings')
    .select('*')
    .order('group_name', { ascending: true })
    .order('points', { ascending: false })
    .order('goal_diff', { ascending: false })
    .order('goals_for', { ascending: false });

  // Fetch live matches to mark teams currently playing
  const { data: liveMatches } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id')
    .eq('status', 'in_play');

  const liveTeamIds = new Set<number>();
  liveMatches?.forEach(m => {
    liveTeamIds.add(m.home_team_id);
    liveTeamIds.add(m.away_team_id);
  });

  if (error) {
    console.error('Error fetching standings:', error);
    return <div className="p-4 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">Error cargando posiciones.</div>;
  }

  // Group by group_name
  const groupedData: Record<string, GroupData> = {};

  (standingsData || []).forEach((row) => {
    if (!groupedData[row.group_name]) {
      groupedData[row.group_name] = {
        name: row.group_name,
        teams: []
      };
    }

    groupedData[row.group_name].teams.push({
      pos: groupedData[row.group_name].teams.length + 1,
      flag: row.flag,
      name: row.name,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalDiff: row.goal_diff,
      points: row.points,
      isPlayingLive: liveTeamIds.has(row.team_id)
    });
  });

  const groups = Object.values(groupedData);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
      {groups.length > 0 ? (
        groups.map((group) => (
          <GroupStandingsTable key={group.name} group={group} />
        ))
      ) : (
        <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-xl">
          No hay posiciones disponibles aún.
        </div>
      )}
    </div>
  );
};
