import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const NUM_BOTS = 10;

async function setup() {
  console.log('Iniciando setup de simulación...');

  // 1. Crear Bots
  console.log(`Creando ${NUM_BOTS} bots...`);
  const bots = [];
  for (let i = 1; i <= NUM_BOTS; i++) {
    const email = `bot_${i}@simulacion.com`;
    const password = 'Simulacion123!';
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `Sim Bot ${i}` }
    });

    if (userError) {
      if (userError.message.includes('already registered')) {
        console.log(`- Bot ${i} ya existe.`);
        // Lo buscamos para guardarlo
        const { data: existingUser } = await supabase.from('profiles').select('*').eq('email', email).single();
        if (existingUser) bots.push(existingUser);
      } else {
        console.error(`- Error creando bot ${i}:`, userError);
      }
    } else {
      console.log(`- Bot ${i} creado exitosamente.`);
      bots.push({ id: userData.user.id, email });
      // El trigger ya creó el perfil, lo actualizamos
      await supabase.from('profiles')
        .update({ nickname: `bot${i}`, paid_groups: true })
        .eq('id', userData.user.id);
    }
  }

  if (bots.length === 0) {
    console.error("No se crearon/encontraron bots. Abortando.");
    process.exit(1);
  }

  // 2. Traer datos base (equipos, jugadores, partidos)
  console.log('Obteniendo equipos, jugadores y partidos...');
  const { data: teams } = await supabase.from('teams').select('*');
  const { data: players } = await supabase.from('players').select('*');
  const { data: matches } = await supabase.from('matches').select('*').like('phase', 'Grupo%');

  if (!teams || !players || !matches) {
    console.error("Error al obtener datos base.");
    process.exit(1);
  }

  // 3. Crear predicciones especiales
  console.log('Generando predicciones especiales...');
  for (const bot of bots) {
    const randomTeam = () => teams[Math.floor(Math.random() * teams.length)].id;
    const randomPlayer = () => players[Math.floor(Math.random() * players.length)].id;

    const specialPrediction = {
      user_id: bot.id,
      champion_team_id: randomTeam(),
      runner_up_team_id: randomTeam(),
      top_scorer_player_id: randomPlayer(),
      disappointment_team_id: randomTeam()
    };

    const { error } = await supabase.from('special_predictions')
      .upsert(specialPrediction, { onConflict: 'user_id' });

    if (error) console.error(`Error en special prediction bot ${bot.email}:`, error);
  }

  // 4. Crear predicciones para los partidos de la fase de grupos
  console.log(`Generando predicciones para ${matches.length} partidos de fase de grupos...`);
  const predictions = [];
  for (const bot of bots) {
    for (const match of matches) {
      predictions.push({
        user_id: bot.id,
        match_id: match.id,
        predicted_home_score: Math.floor(Math.random() * 4), // 0 a 3
        predicted_away_score: Math.floor(Math.random() * 4)  // 0 a 3
      });
    }
  }

  // Insertar en chunks para no saturar
  const chunkSize = 500;
  for (let i = 0; i < predictions.length; i += chunkSize) {
    const chunk = predictions.slice(i, i + chunkSize);
    const { error } = await supabase.from('predictions').upsert(chunk, { onConflict: 'user_id, match_id' });
    if (error) {
      console.error('Error insertando chunk de predicciones:', error);
    }
  }

  console.log('Setup de simulación finalizado con éxito.');
}

setup().catch(console.error);
