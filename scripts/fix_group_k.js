const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: rd_congo } = await supabase.from('teams').select('id').eq('name', 'RD Congo').single();

  if (!rd_congo) {
    console.error("RD Congo not found!");
    return;
  }

  const { error: err1 } = await supabase.from('matches').update({ home_team_id: rd_congo.id }).eq('id', 160);
  const { error: err2 } = await supabase.from('matches').update({ home_team_id: rd_congo.id }).eq('id', 162);

  if (err1) console.error("Error updating 160:", err1);
  if (err2) console.error("Error updating 162:", err2);

  console.log("Group K fixed!");
}

run();
