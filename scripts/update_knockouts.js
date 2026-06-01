const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function art(d, t) {
  const day = parseInt(d.split(' ')[0]);
  const month = d.includes('junio') ? 6 : 7;
  const [hh, mm] = t.replace('hs','').split(':').map(Number);
  
  let utc_h = hh + 3;
  let utc_d = day;
  let utc_m = month;
  
  if (utc_h >= 24) {
    utc_h -= 24;
    utc_d += 1;
    if (utc_d > 30 && utc_m === 6) { 
      utc_d = 1; 
      utc_m = 7; 
    }
  }
  
  return `2026-${String(utc_m).padStart(2,'0')}-${String(utc_d).padStart(2,'0')}T${String(utc_h).padStart(2,'0')}:${String(mm || 0).padStart(2,'0')}:00Z`;
}

const data = [
  {id: 73, d: '28 de junio', t: '16:00'},
  {id: 74, d: '29 de junio', t: '17:30'},
  {id: 75, d: '29 de junio', t: '22:00'},
  {id: 76, d: '29 de junio', t: '14:00'},
  {id: 77, d: '30 de junio', t: '18:00'},
  {id: 78, d: '30 de junio', t: '14:00'},
  {id: 79, d: '30 de junio', t: '22:00'},
  {id: 80, d: '01 de julio', t: '13:00'},
  {id: 81, d: '01 de julio', t: '21:00'},
  {id: 82, d: '01 de julio', t: '17:00'},
  {id: 83, d: '02 de julio', t: '20:00'},
  {id: 84, d: '02 de julio', t: '16:00'},
  {id: 85, d: '03 de julio', t: '00:00'},
  {id: 86, d: '03 de julio', t: '19:00'},
  {id: 87, d: '03 de julio', t: '22:30'},
  {id: 88, d: '03 de julio', t: '15:00'},
  {id: 89, d: '04 de julio', t: '18:00'},
  {id: 90, d: '04 de julio', t: '14:00'},
  {id: 91, d: '05 de julio', t: '17:00'},
  {id: 92, d: '05 de julio', t: '21:00'},
  {id: 93, d: '06 de julio', t: '16:00'},
  {id: 94, d: '06 de julio', t: '21:00'},
  {id: 95, d: '07 de julio', t: '13:00'},
  {id: 96, d: '07 de julio', t: '17:00'},
  {id: 97, d: '09 de julio', t: '17:00'},
  {id: 98, d: '10 de julio', t: '16:00'},
  {id: 99, d: '11 de julio', t: '18:00'},
  {id: 100, d: '11 de julio', t: '22:00'},
  {id: 101, d: '14 de julio', t: '16:00'},
  {id: 102, d: '15 de julio', t: '16:00'},
  {id: 103, d: '18 de julio', t: '18:00'},
  {id: 104, d: '19 de julio', t: '16:00'}
];

async function run() {
  let count = 0;
  for(const r of data) {
    const utcTime = art(r.d, r.t);
    const { error } = await supabase.from('matches').update({ kickoff_time: utcTime }).eq('id', r.id);
    if (error) console.error(error);
    else count++;
  }
  console.log('Updated playoff matches:', count);
}
run();
