import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const response = await fetch(PROMIEDOS_URL, { cache: 'no-store' });
    const html = await response.text();
    
    // Extract NEXT_DATA
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) throw new Error('No NEXT_DATA found in Promiedos page');
    
    const data = JSON.parse(match[1]).props.pageProps.data;

    // 3. Fetch all Teams and Matches from DB
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

    // 4. Update Matches
    const games = data.games.filters;
    let matchesCount = 0;
    
    for (const filter of games) {
      if (!filter.games) continue;
      for (const game of filter.games) {
        if (!game.teams || game.teams.length < 2) continue;
        
        const homeTeamId = promiedosToDbTeam[game.teams[0].id];
        const awayTeamId = promiedosToDbTeam[game.teams[1].id];
        
        if (!homeTeamId || !awayTeamId) continue;

        let mappedStatus = 'pending';
        if (game.status.name === 'Prog.') mappedStatus = 'pending';
        else if (game.status.name === 'Fin' || game.status.name === 'Fin Pen.') mappedStatus = 'finished';
        else mappedStatus = 'in_play';

        const updateData: any = {
          status: mappedStatus,
          home_score: game.winner !== -1 ? game.teams[0].goals : null,
          away_score: game.winner !== -1 ? game.teams[1].goals : null,
          promiedos_id: game.id // Keep promiedos_id synced
        };

        // Find match by exact promiedos_id OR by order-agnostic teams (first unlinked match)
        const matchInDb = dbMatches.find((m: any) => m.promiedos_id === game.id) || 
          dbMatches.find((m: any) => 
            !m.promiedos_id && // Only link if not already linked
            ((m.home_team_id === homeTeamId && m.away_team_id === awayTeamId) ||
             (m.home_team_id === awayTeamId && m.away_team_id === homeTeamId))
          );

        if (matchInDb) {
          await supabase
            .from('matches')
            .update(updateData)
            .eq('id', matchInDb.id);
            
          matchesCount++;
        }
      }
    }

    // 5. Update Players (Goleadores)
    const playersTable = data.players_statistics?.tables?.find((t: any) => t.name === 'Goles');
    let playersCount = 0;
    if (playersTable && playersTable.rows) {
      for (const row of playersTable.rows) {
        const playerObj = row.entity.object;
        const goalsValue = row.values.find((v: any) => v.key === 'Goals')?.value;
        const goals = parseInt(goalsValue) || 0;
        
        const promiedosId = playerObj.sname || playerObj.name;

        await supabase
          .from('players')
          .update({ goals })
          .eq('promiedos_id', promiedosId);
          
        playersCount++;
      }
    }

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
    
    if (process.env.RESEND_API_KEY && process.env.ALERT_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Prode Mundial <onboarding@resend.dev>',
            to: process.env.ALERT_EMAIL,
            subject: '[ALERTA CRÍTICA] Fallo en Prode Mundial Cronjob',
            html: `<p>El cronjob de sincronización ha fallado.</p><p><strong>Error:</strong> ${error.message}</p>`
          })
        });
      } catch(e) {
         console.error("Failed to send alert email", e);
      }
    }
    
    return NextResponse.json({ error: 'Error Interno del Servidor', message: error.message }, { status: 500 });
  }
}
