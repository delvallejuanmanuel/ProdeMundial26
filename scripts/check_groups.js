const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      phase,
      home:teams!home_team_id(name),
      away:teams!away_team_id(name)
    `)
    .like('phase', 'Grupo %');

  if (error) console.error(error);
  
  const groups = {};
  data.forEach(m => {
    if (!groups[m.phase]) groups[m.phase] = new Set();
    if (m.home) groups[m.phase].add(m.home.name);
    if (m.away) groups[m.phase].add(m.away.name);
  });
  
  const result = {};
  for (const p in groups) {
    result[p] = Array.from(groups[p]);
  }
  
  console.log(JSON.stringify(result, null, 2));
}

run();
