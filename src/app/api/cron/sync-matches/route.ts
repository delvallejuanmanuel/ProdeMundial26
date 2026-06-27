import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/mailer';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Faltan variables de entorno' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Autenticar el cron job
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // TEMPORARY: The World Cup hasn't started yet. The Promiedos URL was pulling 2022 data
    // which incorrectly populated the Knockout brackets with 2022 teams (Quarterfinals etc).
    // We return early until the 2026 tournament starts.
    if (new Date() < new Date('2026-06-11T00:00:00Z')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Sincronización pausada: El Mundial 2026 aún no ha comenzado.' 
      });
    }

    // 2. Fetch data from Promiedos
    const PROMIEDOS_URL = 'https://www.promiedos.com.ar/league/fifa-world-cup/fjda'; // 2022 World Cup URL for testing
    const HOME_URL = 'https://www.promiedos.com.ar/';
    
    const [response, homeResponse] = await Promise.all([
      fetch(PROMIEDOS_URL, { cache: 'no-store' }),
      fetch(HOME_URL, { cache: 'no-store' })
    ]);
    
    const html = await response.text();
    const homeHtml = await homeResponse.text();
    
    // Extract NEXT_DATA from tournament page
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) throw new Error('No NEXT_DATA found in Promiedos page');
    const data = JSON.parse(match[1]).props.pageProps.data;

    // Extract NEXT_DATA from homepage for live matches
    const homeMatch = homeHtml.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    let liveGames: any[] = [];
    if (homeMatch) {
      const homeData = JSON.parse(homeMatch[1]).props.pageProps.data;
      if (homeData.leagues) {
        // Look for the Mundial league in the homepage
        const mundial = homeData.leagues.find((l: any) => l.name.includes('Mundial') || l.url_name === 'fifa-world-cup' || l.id === 'fjda');
        if (mundial && mundial.games) {
          liveGames = mundial.games;
        }
      }
    }

    // 3. Combine all games into a single unique map (live games take precedence)
    const uniqueGames = new Map();
    const filters = data.games.filters;
    for (const filter of filters) {
      if (!filter.games) continue;
      for (const game of filter.games) {
        // Only set if not already present to avoid overwriting with duplicate Matchday 1 matches from Fecha 2
        if (!uniqueGames.has(game.id)) {
          uniqueGames.set(game.id, game);
        }
      }
    }
    
    // Add playoffs from brackets
    if (data.brackets && data.brackets.stages) {
      for (const stage of data.brackets.stages) {
        if (!stage.groups) continue;
        for (const group of stage.groups) {
          if (!group.games) continue;
          for (const game of group.games) {
            if (game.id && !uniqueGames.has(game.id)) {
               uniqueGames.set(game.id, game);
            }
          }
        }
      }
    }
    
    // Override with live games from homepage
    for (const game of liveGames) {
      uniqueGames.set(game.id, game);
    }

    // 4. Fetch all Teams and Matches from DB
    const { data: dbTeams, error: dbTeamsError } = await supabase.from('teams').select('*');
    if (dbTeamsError) throw dbTeamsError;
    const { data: dbMatches, error: dbMatchesError } = await supabase.from('matches').select('*');
    if (dbMatchesError) throw dbMatchesError;

    const promiedosToDbTeam: Record<string, number> = {};
    for (const team of dbTeams) {
      if (team.flag) {
        const parts = team.flag.split('/');
        if (parts.length > 5) {
          const promiedosId = parts[5];
          promiedosToDbTeam[promiedosId] = team.id;
        }
      }
    }

    // 5. Update Matches
    let matchesCount = 0;
    
    for (const game of uniqueGames.values()) {
        if (!game.teams || game.teams.length < 2) continue;
        
        const homeTeamId = game.teams[0].id ? promiedosToDbTeam[game.teams[0].id] : undefined;
        const awayTeamId = game.teams[1].id ? promiedosToDbTeam[game.teams[1].id] : undefined;
        

        let mappedStatus = 'pending';
        if (game.status.name === 'Prog.') mappedStatus = 'pending';
        else if (game.status.name === 'Fin' || game.status.name === 'Fin Pen.' || game.status.name === 'Finalizado') mappedStatus = 'finished';
        else mappedStatus = 'in_play';

        const updateData: any = {
          status: mappedStatus,
          home_score: game.scores && game.scores.length >= 2 ? game.scores[0] : null,
          away_score: game.scores && game.scores.length >= 2 ? game.scores[1] : null,
          promiedos_id: game.id // Keep promiedos_id synced
        };
        
        if (homeTeamId) updateData.home_team_id = homeTeamId;
        if (awayTeamId) updateData.away_team_id = awayTeamId;

        // Find match by exact promiedos_id OR by order-agnostic teams OR by exact playoff kickoff_time
        let matchInDb = dbMatches.find((m: any) => m.promiedos_id === game.id);
        
        if (!matchInDb && homeTeamId && awayTeamId) {
            matchInDb = dbMatches.find((m: any) => 
                !m.promiedos_id && // Only link if not already linked
                ((m.home_team_id === homeTeamId && m.away_team_id === awayTeamId) ||
                 (m.home_team_id === awayTeamId && m.away_team_id === homeTeamId))
            );
        }
        
        // Playoff matching by exact time if no promiedos_id and home/away match fails
        if (!matchInDb && game.start_time) {
            // game.start_time format: "29-06-2026 17:30" (Argentina time UTC-3)
            const parts = game.start_time.split(/[- :]/);
            if (parts.length === 5) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const hour = parseInt(parts[3], 10);
                const minute = parseInt(parts[4], 10);
                
                // Create Date in UTC matching the Argentina time + 3 hours
                const promiedosUtcTime = new Date(Date.UTC(year, month, day, hour + 3, minute));
                
                matchInDb = dbMatches.find((m: any) => {
                    if (m.promiedos_id || m.phase.toLowerCase().startsWith('grupo')) return false;
                    const dbTime = new Date(m.kickoff_time);
                    return dbTime.getTime() === promiedosUtcTime.getTime();
                });
            }
        }

        if (matchInDb) {
          matchInDb.promiedos_id = game.id;
          if (homeTeamId) matchInDb.home_team_id = homeTeamId;
          if (awayTeamId) matchInDb.away_team_id = awayTeamId;

          await supabase
            .from('matches')
            .update(updateData)
            .eq('id', matchInDb.id);
            
          matchesCount++;
        }
    }

    // 6. Update Players (Goleadores) via match_player_goals
    let playersCount = 0;

    // Process goals per specific match
    for (const [gameId, game] of uniqueGames.entries()) {
      if (!game.teams || game.teams.length < 2) continue;
      
      const homeTeamId = game.teams[0].id ? promiedosToDbTeam[game.teams[0].id] : undefined;
      const awayTeamId = game.teams[1].id ? promiedosToDbTeam[game.teams[1].id] : undefined;
      
      const matchInDb = dbMatches.find((m: any) => m.promiedos_id === gameId) || 
          dbMatches.find((m: any) => 
            !m.promiedos_id && 
            ((m.home_team_id === homeTeamId && m.away_team_id === awayTeamId) ||
             (m.home_team_id === awayTeamId && m.away_team_id === homeTeamId))
          );
          
      if (!matchInDb) continue; 

      const matchPlayerGoals: Record<string, { goals: number, teamName: string }> = {};

      for (const team of game.teams) {
        if (team.goals && Array.isArray(team.goals)) {
          for (const goal of team.goals) {
             const pName = goal.player_sname || goal.player_name;
             if (!pName) continue;
             if (goal.goal_type && goal.goal_type.toUpperCase().includes('E.C')) continue;
             
             if (!matchPlayerGoals[pName]) matchPlayerGoals[pName] = { goals: 0, teamName: team.name };
             matchPlayerGoals[pName].goals++;
          }
        }
      }

      for (const [promiedosId, data] of Object.entries(matchPlayerGoals)) {
        let playerId = null;
        
        const { data: existingPlayers } = await supabase
          .from('players')
          .select('id')
          .eq('promiedos_id', promiedosId)
          .limit(1);
          
        if (existingPlayers && existingPlayers.length > 0) {
          playerId = existingPlayers[0].id;
        } else {
          const teamInDb = dbTeams?.find(t => t.name === data.teamName);
          if (teamInDb) {
            const { data: newPlayer } = await supabase
              .from('players')
              .insert({
                name: promiedosId,
                promiedos_id: promiedosId,
                team_id: teamInDb.id,
                goals: 0
              })
              .select('id')
              .single();
            if (newPlayer) playerId = newPlayer.id;
          }
        }

        if (playerId) {
          await supabase
            .from('match_player_goals')
            .upsert({
              match_id: matchInDb.id,
              player_id: playerId,
              goals_count: data.goals
            }, { onConflict: 'match_id, player_id' });
            
          playersCount++;
        }
      }
    }

    // Recalcular goles totales de forma auto-controlada
    await supabase.rpc('recalculate_player_goals');

    // 6. Trigger points calculation for all finished matches
    const { error: rpcError } = await supabase.rpc('calculate_points');

    if (rpcError) {
      console.error("Error calculando puntos:", rpcError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Procesados ${matchesCount} partidos y ${playersCount} goleadores desde Promiedos.` 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    
    if (process.env.ALERT_EMAIL) {
      try {
        await sendEmail({
          to: process.env.ALERT_EMAIL,
          subject: '[ALERTA CRÍTICA] Fallo en Prode Mundial Cronjob',
          html: `<p>El cronjob de sincronización ha fallado.</p><p><strong>Error:</strong> ${error.message}</p>`,
        });
      } catch (mailErr) {
        console.error('Error enviando alerta por email:', mailErr);
      }
    }
    
    return NextResponse.json({ error: 'Error Interno del Servidor', message: error.message }, { status: 500 });
  }
}
