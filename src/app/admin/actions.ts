"use server";

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// Cliente con permisos de administrador que ignora el RLS
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE!;
  return createAdminClient(url, key, { auth: { persistSession: false } });
}

export async function updatePlayerGoalsAction(playerId: number, goals: number) {
  const supabaseAdmin = getAdminClient();
  
  const { error } = await supabaseAdmin
    .from('players')
    .update({ goals })
    .eq('id', playerId);

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateMatchAction(matchId: number, status: string, homeScore: number | null, awayScore: number | null) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from('matches')
    .update({
      status,
      home_score: homeScore,
      away_score: awayScore
    })
    .eq('id', matchId);

  if (error) throw new Error(error.message);

  if (status === 'finished') {
    await checkAndAdvanceGroup(matchId);
  }

  return { success: true };
}

const GROUP_ADVANCEMENT_MAP: Record<string, {
  first: { matchId: number; position: 'home' | 'away' },
  second: { matchId: number; position: 'home' | 'away' }
}> = {
  'Grupo A': { first: { matchId: 79, position: 'home' }, second: { matchId: 73, position: 'home' } },
  'Grupo B': { first: { matchId: 85, position: 'home' }, second: { matchId: 73, position: 'away' } },
  'Grupo C': { first: { matchId: 76, position: 'home' }, second: { matchId: 75, position: 'away' } },
  'Grupo D': { first: { matchId: 81, position: 'home' }, second: { matchId: 88, position: 'home' } },
  'Grupo E': { first: { matchId: 74, position: 'home' }, second: { matchId: 78, position: 'home' } },
  'Grupo F': { first: { matchId: 75, position: 'home' }, second: { matchId: 76, position: 'away' } },
  'Grupo G': { first: { matchId: 82, position: 'home' }, second: { matchId: 88, position: 'away' } },
  'Grupo H': { first: { matchId: 84, position: 'home' }, second: { matchId: 86, position: 'away' } },
  'Grupo I': { first: { matchId: 77, position: 'home' }, second: { matchId: 78, position: 'away' } },
  'Grupo J': { first: { matchId: 86, position: 'home' }, second: { matchId: 84, position: 'away' } },
  'Grupo K': { first: { matchId: 87, position: 'home' }, second: { matchId: 83, position: 'home' } },
  'Grupo L': { first: { matchId: 80, position: 'home' }, second: { matchId: 83, position: 'away' } },
};

async function checkAndAdvanceGroup(matchId: number) {
  const supabaseAdmin = getAdminClient();

  // 1. Get the phase of the updated match
  const { data: match } = await supabaseAdmin.from('matches').select('phase').eq('id', matchId).single();
  if (!match || !match.phase.startsWith('Grupo ')) return;

  const phase = match.phase;

  // 2. Check if all matches in this phase are finished
  const { data: groupMatches } = await supabaseAdmin.from('matches').select('status').eq('phase', phase);
  if (!groupMatches) return;

  const allFinished = groupMatches.every(m => m.status === 'finished');
  if (!allFinished) return;

  // 3. Get standings for this group
  const { data: standings } = await supabaseAdmin
    .from('v_group_standings')
    .select('team_id, points, goal_diff, goals_for')
    .eq('group_name', phase)
    .order('points', { ascending: false })
    .order('goal_diff', { ascending: false })
    .order('goals_for', { ascending: false });

  if (!standings || standings.length < 2) return;

  const firstPlaceId = standings[0].team_id;
  const secondPlaceId = standings[1].team_id;

  const map = GROUP_ADVANCEMENT_MAP[phase];
  if (!map) return;

  // 4. Update the matches
  // Update 1st place match
  await supabaseAdmin.from('matches').update({
    [map.first.position === 'home' ? 'home_team_id' : 'away_team_id']: firstPlaceId
  }).eq('id', map.first.matchId);

  // Update 2nd place match
  await supabaseAdmin.from('matches').update({
    [map.second.position === 'home' ? 'home_team_id' : 'away_team_id']: secondPlaceId
  }).eq('id', map.second.matchId);
}
