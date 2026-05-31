const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: rd_congo } = await supabase.from('teams').select('id, name').eq('name', 'RD Congo').single();
  const { data: alemania } = await supabase.from('teams').select('id, name').eq('name', 'Alemania').single();

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, phase,
      home:teams!home_team_id(name),
      away:teams!away_team_id(name)
    `)
    .or(`home_team_id.eq.${rd_congo.id},away_team_id.eq.${rd_congo.id},home_team_id.eq.${alemania.id},away_team_id.eq.${alemania.id}`)
    .order('id');

  console.log(JSON.stringify(matches, null, 2));
}

run();
