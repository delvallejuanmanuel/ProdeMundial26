import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function advanceTime() {
  const args = process.argv.slice(2);
  const countIndex = args.indexOf('--count');
  const count = countIndex !== -1 ? parseInt(args[countIndex + 1]) : 4;
  const isAll = args.includes('--all');

  console.log(`Buscando partidos pendientes...`);

  const { data: pendingMatches, error: matchesError } = await supabase
    .from('matches')
    .select('*, home_team:home_team_id(*), away_team:away_team_id(*)')
    .eq('status', 'pending')
    .like('phase', 'Grupo%')
    .order('kickoff_time', { ascending: true });

  if (matchesError) {
    console.error("Error buscando partidos:", matchesError);
    process.exit(1);
  }

  if (!pendingMatches || pendingMatches.length === 0) {
    console.log("No hay más partidos de fase de grupos pendientes.");
    process.exit(0);
  }

  const matchesToSimulate = isAll ? pendingMatches : pendingMatches.slice(0, count);

  console.log(`Simulando ${matchesToSimulate.length} partidos...`);

  // Obtener bots para el chat
  const { data: bots } = await supabase.from('profiles').select('*').like('email', '%@simulacion.com');
  const hasBots = bots && bots.length > 0;

  for (const match of matchesToSimulate) {
    const homeScore = Math.floor(Math.random() * 4);
    const awayScore = Math.floor(Math.random() * 4);

    // Actualizar partido
    const { error: updateError } = await supabase.from('matches')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        status: 'finished'
      })
      .eq('id', match.id);

    if (updateError) {
      console.error(`Error actualizando partido ${match.id}:`, updateError);
      continue;
    }

    console.log(`[FIN] ${match.home_team.name} ${homeScore} - ${awayScore} ${match.away_team.name}`);

    // Chat bot reaction
    if (hasBots && Math.random() > 0.3) { // 70% chance to comment
      const bot = bots[Math.floor(Math.random() * bots.length)];
      let comment = "";
      if (homeScore > awayScore) {
        comment = `¡Gran victoria de ${match.home_team.name}! ${homeScore}-${awayScore}.`;
      } else if (awayScore > homeScore) {
        comment = `¡Triunfazo de ${match.away_team.name} contra ${match.home_team.name} (${awayScore}-${homeScore})!`;
      } else {
        comment = `Aburrido empate ${homeScore}-${awayScore} entre ${match.home_team.name} y ${match.away_team.name}.`;
      }

      await supabase.from('global_chat_messages').insert({
        user_id: bot.id,
        content: comment
      });
    }
  }

  // Recalcular puntos
  console.log("Recalculando puntos...");
  const { error: rpcError } = await supabase.rpc('calculate_points');
  if (rpcError) {
    console.error("Error recalculando puntos:", rpcError);
  } else {
    console.log("Puntos recalculados exitosamente.");
  }

  console.log("Avance de tiempo completado.");
}

advanceTime().catch(console.error);
