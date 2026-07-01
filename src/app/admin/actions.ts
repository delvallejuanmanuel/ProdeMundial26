"use server";

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/mailer';

// Cliente con permisos de administrador que ignora el RLS
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE!;
  return createAdminClient(url, key, { auth: { persistSession: false } });
}

export async function getAdminUsersAction() {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, predictions(match_id)')
    .order('created_at', { ascending: false });
    
  if (error) throw new Error(error.message);
  return data;
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

export async function updateMatchAction(
  matchId: number, 
  status: string, 
  homeScore: number | null, 
  awayScore: number | null,
  winnerByPenaltiesTeamId?: number | null,
  homeTeamId?: number | null,
  awayTeamId?: number | null
) {
  const supabaseAdmin = getAdminClient();

  const updateData: any = {
    status,
    home_score: homeScore,
    away_score: awayScore,
    winner_by_penalties_team_id: winnerByPenaltiesTeamId || null
  };

  if (homeTeamId !== undefined) updateData.home_team_id = homeTeamId;
  if (awayTeamId !== undefined) updateData.away_team_id = awayTeamId;

  const { error } = await supabaseAdmin
    .from('matches')
    .update(updateData)
    .eq('id', matchId);

  if (error) throw new Error(error.message);

  if (status === 'finished') {
    await checkAndAdvanceGroup(matchId);
    await checkAndAdvancePlayoff(matchId);
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

const PLAYOFF_DEPENDENCIES = [
  // Octavos
  { id: 89, h: 74, a: 77 }, { id: 90, h: 73, a: 75 }, { id: 91, h: 76, a: 78 }, { id: 92, h: 79, a: 80 },
  { id: 93, h: 83, a: 84 }, { id: 94, h: 81, a: 82 }, { id: 95, h: 86, a: 88 }, { id: 96, h: 85, a: 87 },
  // Cuartos
  { id: 97, h: 89, a: 90 }, { id: 98, h: 93, a: 94 }, { id: 99, h: 91, a: 92 }, { id: 100, h: 95, a: 96 },
  // Semis
  { id: 101, h: 97, a: 98 }, { id: 102, h: 99, a: 100 },
  // Final
  { id: 104, h: 101, a: 102 },
  // Tercer Puesto (Losers of Semis)
  { id: 103, h: -101, a: -102 } // Negative denotes loser
];

export async function checkAndAdvancePlayoff(matchId: number) {
  const supabaseAdmin = getAdminClient();

  // 1. Check if match is playoff and get results
  const { data: match } = await supabaseAdmin.from('matches').select('*').eq('id', matchId).single();
  if (!match || match.status !== 'finished' || match.phase.toLowerCase().startsWith('grupo')) return;

  // 2. Determine winner and loser
  let winnerId: number | null = null;
  let loserId: number | null = null;

  if (match.winner_by_penalties_team_id) {
    winnerId = match.winner_by_penalties_team_id;
    loserId = match.home_team_id === winnerId ? match.away_team_id : match.home_team_id;
  } else if (match.home_score !== null && match.away_score !== null) {
    if (match.home_score > match.away_score) {
      winnerId = match.home_team_id;
      loserId = match.away_team_id;
    } else if (match.away_score > match.home_score) {
      winnerId = match.away_team_id;
      loserId = match.home_team_id;
    }
  }

  if (!winnerId) return;

  // 3. Find dependencies and update future matches
  for (const dep of PLAYOFF_DEPENDENCIES) {
    // Winner logic
    if (dep.h === matchId) {
      await supabaseAdmin.from('matches').update({ home_team_id: winnerId }).eq('id', dep.id);
    } else if (dep.a === matchId) {
      await supabaseAdmin.from('matches').update({ away_team_id: winnerId }).eq('id', dep.id);
    }

    // Loser logic (e.g. for Third Place match)
    if (dep.h === -matchId && loserId) {
      await supabaseAdmin.from('matches').update({ home_team_id: loserId }).eq('id', dep.id);
    } else if (dep.a === -matchId && loserId) {
      await supabaseAdmin.from('matches').update({ away_team_id: loserId }).eq('id', dep.id);
    }
  }
}

export async function updateMatchTeamsAction(
  matchId: number, 
  homeTeamId: number | null, 
  awayTeamId: number | null
) {
  const supabaseAdmin = getAdminClient();

  const { error } = await supabaseAdmin
    .from('matches')
    .update({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId
    })
    .eq('id', matchId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function toggleChatBlockAction(userId: string, currentStatus: boolean) {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ chat_blocked: !currentStatus })
    .eq('id', userId);
  
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function sendReminderEmailAction(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      subject: '🏆 ¡Falta poco! Cargá tus pronósticos del Prode',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #16a34a, #22c55e); padding: 25px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; font-weight: 900; letter-spacing: 1px;">🏆 PRODE MUNDIAL 26</h1>
          </div>
          <div style="padding: 30px 20px; text-align: center;">
            <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Hola ${name || 'Jugador'},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 25px;">Te recordamos que aún tenés pronósticos pendientes por cargar. <strong>¡Hay partidos muy próximos a cerrarse!</strong></p>
            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 30px;">Apurate antes de que empiecen y te quedes sin sumar puntos para el ranking.</p>
            <a href="https://prodemundial26.com/fixture" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 50px; text-transform: uppercase;">Cargar Pronósticos ⚽</a>
          </div>
          <div style="background-color: #020617; padding: 15px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">No respondas a este correo. Nos vemos en la cancha.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error desconocido al enviar correo' };
  }
}
