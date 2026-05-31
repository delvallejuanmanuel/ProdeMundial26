const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      phase,
      home:teams!home_team_id(name),
      away:teams!away_team_id(name)
    `)
    .eq('phase', 'Grupo K');

  if (error) console.error(error);
  
  console.log(JSON.stringify(data, null, 2));
}

run();
