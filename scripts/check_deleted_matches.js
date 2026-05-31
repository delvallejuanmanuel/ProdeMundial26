const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: matches } = await supabase.from('matches').select('id, phase').order('id');
  console.log("Total matches:", matches.length);
  console.log("First 5:", matches.slice(0, 5));
  console.log("Last 5:", matches.slice(-5));
}

run();
