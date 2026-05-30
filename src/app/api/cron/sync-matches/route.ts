import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio'; // We don't strictly need cheerio if we just regex match the script, but we can use regex.

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
    // 2. Fetch data from Promiedos
    const PROMIEDOS_URL = 'https://www.promiedos.com.ar/league/fifa-world-cup/fjda'; // 2022 World Cup URL for testing
    const response = await fetch(PROMIEDOS_URL, { cache: 'no-store' });
    const html = await response.text();
    
    // Extract NEXT_DATA
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (!match) throw new Error('No NEXT_DATA found in Promiedos page');
    
    const data = JSON.parse(match[1]).props.pageProps.data;

    // 3. Map teams using the 'flag' column in our DB
    const { data: dbTeams, error: dbTeamsError } = await supabase.from('teams').select('*');
    if (dbTeamsError) throw dbTeamsError;

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
        };

        await supabase
          .from('matches')
          .update(updateData)
          .eq('promiedos_id', game.id);
          
        matchesCount++;
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
    return NextResponse.json({ error: 'Error Interno del Servidor', message: error.message }, { status: 500 });
  }
}
