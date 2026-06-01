import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function rollback() {
  console.log('Iniciando rollback de la simulación...');

  // 1. Eliminar bots
  console.log('Buscando bots...');
  const { data: bots, error: botsError } = await supabase
    .from('profiles')
    .select('id, email')
    .like('email', '%@simulacion.com');

  if (botsError) {
    console.error("Error buscando bots:", botsError);
  } else if (bots && bots.length > 0) {
    console.log(`Eliminando ${bots.length} bots...`);
    for (const bot of bots) {
      const { error } = await supabase.auth.admin.deleteUser(bot.id);
      if (error) {
        console.error(`Error eliminando bot ${bot.email}:`, error);
      } else {
        console.log(`- Bot eliminado: ${bot.email}`);
      }
    }
  } else {
    console.log("No se encontraron bots para eliminar.");
  }

  // 2. Restaurar partidos de fase de grupos
  console.log('Restaurando estado de los partidos...');
  const { error: matchError } = await supabase
    .from('matches')
    .update({
      status: 'pending',
      home_score: null,
      away_score: null
    })
    .like('phase', 'Grupo%')
    .neq('status', 'pending');

  if (matchError) {
    console.error("Error restaurando partidos:", matchError);
  } else {
    console.log("Partidos restaurados a 'pending'.");
  }

  // 3. Resetear puntos (por si quedaron predicciones de usuarios reales en partidos revertidos)
  console.log('Reseteando awarded_points a 0...');
  const { error: predError } = await supabase
    .from('predictions')
    .update({ awarded_points: 0 })
    .gt('awarded_points', 0); // Solo los que tengan puntos asignados

  if (predError) {
    console.error("Error reseteando awarded_points:", predError);
  } else {
    console.log("awarded_points reseteado a 0.");
  }

  // 4. Resetear goles de jugadores
  console.log('Reseteando goles de jugadores...');
  const { error: playersError } = await supabase
    .from('players')
    .update({ goals: 0 })
    .gt('goals', 0);
  
  if (playersError) {
    console.error("Error reseteando goles:", playersError);
  } else {
    console.log("Goles reseteados a 0.");
  }

  // 5. Limpiar equipos en partidos de playoffs (ID >= 73)
  console.log('Limpiando asignaciones en playoffs...');
  const { error: playoffError } = await supabase
    .from('matches')
    .update({
      home_team_id: null,
      away_team_id: null
    })
    .gte('id', 73);
  
  if (playoffError) {
    console.error("Error limpiando playoffs:", playoffError);
  } else {
    console.log("Playoffs limpiados.");
  }

  // Recalculamos por las dudas
  await supabase.rpc('calculate_points');

  console.log("Rollback completado con éxito.");
}

rollback().catch(console.error);
