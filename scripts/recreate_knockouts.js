const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Delete all matches >= 73 to recreate them properly
  const { error: deleteError } = await supabase.from('matches').delete().gte('id', 73);
  if (deleteError) {
    console.error("Delete error:", deleteError);
    return;
  }
  console.log("Deleted old knockout matches");

  // 2. Generate matches 73 to 104
  const newMatches = [];
  
  // 16avos: 73 to 88
  for (let i = 73; i <= 88; i++) {
    newMatches.push({
      id: i,
      phase: '16avos de Final',
      kickoff_time: '2026-06-25T16:00:00Z', // placeholder time
      status: 'pending',
      promiedos_id: null
    });
  }

  // Octavos: 89 to 96
  for (let i = 89; i <= 96; i++) {
    newMatches.push({
      id: i,
      phase: 'Octavos de Final',
      kickoff_time: '2026-06-29T16:00:00Z', // placeholder time
      status: 'pending',
      promiedos_id: null
    });
  }

  // Cuartos: 97 to 100
  for (let i = 97; i <= 100; i++) {
    newMatches.push({
      id: i,
      phase: 'Cuartos de Final',
      kickoff_time: '2026-07-04T16:00:00Z', // placeholder time
      status: 'pending',
      promiedos_id: null
    });
  }

  // Semis: 101 to 102
  for (let i = 101; i <= 102; i++) {
    newMatches.push({
      id: i,
      phase: 'Semifinal',
      kickoff_time: '2026-07-09T16:00:00Z', // placeholder time
      status: 'pending',
      promiedos_id: null
    });
  }

  // Tercer Puesto: 103
  newMatches.push({
    id: 103,
    phase: 'Tercer Puesto',
    kickoff_time: '2026-07-13T16:00:00Z', // placeholder time
    status: 'pending',
    promiedos_id: null
  });

  // Final: 104
  newMatches.push({
    id: 104,
    phase: 'Final',
    kickoff_time: '2026-07-14T16:00:00Z', // placeholder time
    status: 'pending',
    promiedos_id: null
  });

  const { error: insertError } = await supabase.from('matches').insert(newMatches);
  if (insertError) {
    console.error("Insert error:", insertError);
  } else {
    console.log("Successfully created matches 73 to 104");
  }
}

run();
