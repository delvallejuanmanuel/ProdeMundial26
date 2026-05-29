import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !apiKey) {
    return NextResponse.json({ error: 'Faltan variables de entorno' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Autenticar el cron job
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  console.log('--- debug cron ---');
  console.log('Secret query param:', secret ? `defined (len: ${secret.length})` : 'NOT defined');
  console.log('CRON_SECRET env var:', process.env.CRON_SECRET ? `defined (len: ${process.env.CRON_SECRET.length})` : 'NOT defined');
  console.log('Are they equal?:', secret === process.env.CRON_SECRET);

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    // 2. Fetch matches from API-Football
    // Usamos League 1 (Mundial). Para producción deberíamos pedir los de hoy: `date=${today}`
    // Pero como estamos probando o si queremos forzar actualización general, podemos dejarlo fijo en la temporada.
    const today = new Date().toISOString().split('T')[0];
    
    // NOTA: Para el Mundial 2026, usar season=2026. 
    // Para no exceder los límites de la API, pedimos solo los partidos de HOY.
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${today}`, {
      headers: {
        'x-apisports-key': apiKey,
      }
    });
    
    const data = await response.json();
    const fixtures = data.response;

    if (!fixtures || fixtures.length === 0) {
       return NextResponse.json({ message: 'No hay partidos programados para hoy.' });
    }

    // 3. Process each match and update our database
    for (const item of fixtures) {
      const fixture = item.fixture;
      const goals = item.goals;
      const score = item.score;
      const teams = item.teams;
      
      const api_id = fixture.id;
      const shortStatus = fixture.status.short; // 'FT', '1H', '2H', 'NS', 'PEN', 'AET'
      
      // Mapeo de estado:
      let mappedStatus = 'pending';
      if (['NS', 'TBD', 'PST'].includes(shortStatus)) {
        mappedStatus = 'pending';
      } else if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT'].includes(shortStatus)) {
        mappedStatus = 'in_play';
      } else if (['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(shortStatus)) {
        mappedStatus = 'finished';
      }

      // Preparamos los datos de actualización
      const updateData: any = {
        status: mappedStatus,
        home_score: goals.home !== null ? goals.home : null,
        away_score: goals.away !== null ? goals.away : null,
      };

      // Manejar victoria por penales
      if (shortStatus === 'PEN' && score.penalty) {
        if (score.penalty.home > score.penalty.away) {
           // Local ganó por penales (debemos buscar su ID en nuestra BD mediante su api_id)
           // Haremos un select rápido para obtener el ID interno
           const { data: homeTeamData } = await supabase.from('teams').select('id').eq('api_id', teams.home.id).single();
           if (homeTeamData) updateData.winner_by_penalties_team_id = homeTeamData.id;
        } else if (score.penalty.away > score.penalty.home) {
           const { data: awayTeamData } = await supabase.from('teams').select('id').eq('api_id', teams.away.id).single();
           if (awayTeamData) updateData.winner_by_penalties_team_id = awayTeamData.id;
        }
      }

      // Actualizar en la base de datos buscando por el api_id del partido
      await supabase
        .from('matches')
        .update(updateData)
        .eq('api_id', api_id);
    }

    // 4. Trigger points calculation for all finished matches
    // Ejecuta el procedure en Supabase para recalcular puntos si corresponde.
    const { error: rpcError } = await supabase.rpc('calculate_points');

    if (rpcError) {
      console.error("Error calculando puntos:", rpcError);
      return NextResponse.json({ error: 'Error al calcular puntos', details: rpcError }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${fixtures.length} partidos procesados exitosamente.` 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: 'Error Interno del Servidor', message: error.message }, { status: 500 });
  }
}
