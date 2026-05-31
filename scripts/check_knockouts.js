const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: matches } = await supabase
    .from('matches')
    .select('id, phase')
    .gte('id', 73)
    .lte('id', 104)
    .order('id');

  console.log(matches.map(m => m.id).join(', '));
}

run();
