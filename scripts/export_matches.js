const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id, phase, kickoff_time, status,
      home:teams!home_team_id(name),
      away:teams!away_team_id(name)
    `)
    .order('id');

  if (error) { console.error(error); return; }

  console.log("Total matches:", data.length);
  console.log("\n=== GROUP STAGE ===");
  const groups = data.filter(m => m.phase.startsWith('Grupo'));
  groups.forEach(m => {
    const d = new Date(m.kickoff_time);
    console.log(`ID:${m.id} | ${m.phase} | ${d.toISOString()} | ${m.home?.name} vs ${m.away?.name}`);
  });

  console.log("\n=== KNOCKOUT ===");
  const knockout = data.filter(m => !m.phase.startsWith('Grupo'));
  knockout.forEach(m => {
    const d = new Date(m.kickoff_time);
    console.log(`ID:${m.id} | ${m.phase} | ${d.toISOString()}`);
  });
}

run();
