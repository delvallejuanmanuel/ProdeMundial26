const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: ART = UTC-3. Times below are in ART, stored as UTC.
// To convert ART -> UTC: add 3 hours.
// e.g. 16:00 ART = 19:00 UTC same day. 23:00 ART = 02:00 UTC next day.
function art(dateStr, artHour, artMin = 0) {
  const [year, month, day] = dateStr.split('-').map(Number);
  let utcHour = artHour + 3;
  let utcDay = day;
  let utcMonth = month;
  if (utcHour >= 24) {
    utcHour -= 24;
    utcDay += 1;
    // simple day overflow (sufficient for June/July)
    const daysInMonth = new Date(year, utcMonth, 0).getDate();
    if (utcDay > daysInMonth) { utcDay = 1; utcMonth += 1; }
  }
  return `${year}-${String(utcMonth).padStart(2,'0')}-${String(utcDay).padStart(2,'0')}T${String(utcHour).padStart(2,'0')}:${String(artMin).padStart(2,'0')}:00Z`;
}

// All group stage matches per FIFA official fixture
// Format: [id, kickoff_utc, home_team_name, away_team_name]
// Times in ART converted to UTC
const groupMatches = [
  // GRUPO A
  [1,  art('2026-06-11', 16), 'México',           'Sudáfrica'],
  [2,  art('2026-06-11', 23), 'Corea del Sur',    'Republica Checa'],
  [3,  art('2026-06-17', 16), 'Sudáfrica',        'Republica Checa'],
  [4,  art('2026-06-17', 22), 'México',           'Corea del Sur'],
  [5,  art('2026-06-23', 22), 'Republica Checa',  'México'],
  [6,  art('2026-06-23', 22), 'Sudáfrica',        'Corea del Sur'],

  // GRUPO B
  [7,  art('2026-06-12', 13), 'Canadá',           'Bosnia Herzegovina'],
  [8,  art('2026-06-12', 19), 'Qatar',            'Suiza'],
  [9,  art('2026-06-18', 16), 'Suiza',            'Bosnia Herzegovina'],
  [10, art('2026-06-18', 19), 'Canadá',           'Qatar'],
  [11, art('2026-06-24', 22), 'Suiza',            'Canadá'],
  [12, art('2026-06-24', 22), 'Bosnia Herzegovina', 'Qatar'],

  // GRUPO C
  [13, art('2026-06-12', 22), 'Brasil',           'Marruecos'],
  [14, art('2026-06-13', 1),  'Haití',            'Escocia'],
  [15, art('2026-06-19', 22), 'Escocia',          'Marruecos'],
  [16, art('2026-06-19', 19), 'Brasil',           'Haití'],
  [17, art('2026-06-25', 22), 'Escocia',          'Brasil'],
  [18, art('2026-06-25', 22), 'Marruecos',        'Haití'],

  // GRUPO D
  [19, art('2026-06-12', 13), 'Estados Unidos',   'Paraguay'],
  [20, art('2026-06-13', 4),  'Australia',        'Turquía'],
  [21, art('2026-06-19', 13), 'Estados Unidos',   'Australia'],
  [22, art('2026-06-19', 16), 'Turquía',          'Paraguay'],
  [23, art('2026-06-25', 16), 'Estados Unidos',   'Turquía'],
  [24, art('2026-06-25', 16), 'Paraguay',         'Australia'],

  // GRUPO E
  [25, art('2026-06-14', 13), 'Alemania',         'Curazao'],
  [26, art('2026-06-14', 16), 'Costa de Marfil',  'Ecuador'],
  [27, art('2026-06-20', 13), 'Alemania',         'Costa de Marfil'],
  [28, art('2026-06-20', 16), 'Ecuador',          'Curazao'],
  [29, art('2026-06-26', 16), 'Ecuador',          'Alemania'],
  [30, art('2026-06-26', 16), 'Curazao',          'Costa de Marfil'],

  // GRUPO F
  [31, art('2026-06-14', 19), 'Países Bajos',     'Japón'],
  [32, art('2026-06-14', 22), 'Suecia',           'Túnez'],
  [33, art('2026-06-20', 19), 'Países Bajos',     'Suecia'],
  [34, art('2026-06-20', 22), 'Túnez',            'Japón'],
  [35, art('2026-06-26', 19), 'Túnez',            'Países Bajos'],
  [36, art('2026-06-26', 19), 'Japón',            'Suecia'],

  // GRUPO G
  [37, art('2026-06-15', 13), 'Bélgica',          'Egipto'],
  [38, art('2026-06-15', 16), 'Irán',             'Nueva Zelanda'],
  [39, art('2026-06-21', 13), 'Bélgica',          'Irán'],
  [40, art('2026-06-21', 16), 'Nueva Zelanda',    'Egipto'],
  [41, art('2026-06-26', 22), 'Nueva Zelanda',    'Bélgica'],
  [42, art('2026-06-26', 22), 'Egipto',           'Irán'],

  // GRUPO H
  [43, art('2026-06-15', 13), 'España',           'Arabia Saudita'],
  [44, art('2026-06-15', 19), 'Uruguay',          'Cabo Verde'],
  [45, art('2026-06-21', 19), 'España',           'Uruguay'],
  [46, art('2026-06-21', 22), 'Arabia Saudita',   'Cabo Verde'],
  [47, art('2026-06-27', 22), 'Uruguay',          'España'],
  [48, art('2026-06-27', 22), 'Arabia Saudita',   'Cabo Verde'],

  // GRUPO I
  [49, art('2026-06-16', 13), 'Francia',          'Senegal'],
  [50, art('2026-06-16', 16), 'Irak',             'Noruega'],
  [51, art('2026-06-22', 16), 'Noruega',          'Senegal'],
  [52, art('2026-06-22', 19), 'Francia',          'Irak'],
  [53, art('2026-06-27', 19), 'Noruega',          'Francia'],
  [54, art('2026-06-27', 19), 'Senegal',          'Irak'],

  // GRUPO J
  [55, art('2026-06-16', 22), 'Argentina',        'Austria'],
  [56, art('2026-06-17', 1),  'Jordania',         'Argelia'],
  [57, art('2026-06-22', 13), 'Argentina',        'Jordania'],
  [58, art('2026-06-22', 22), 'Argelia',          'Austria'],
  [59, art('2026-06-27', 16), 'Jordania',         'Argentina'],
  [60, art('2026-06-27', 16), 'Argelia',          'Austria'],

  // GRUPO K
  [61, art('2026-06-17', 13), 'Portugal',         'Uzbekistán'],
  [62, art('2026-06-17', 16), 'Colombia',         'RD Congo'],
  [63, art('2026-06-23', 13), 'Portugal',         'Colombia'],
  [64, art('2026-06-23', 16), 'RD Congo',         'Uzbekistán'],
  [65, art('2026-06-27', 22), 'Colombia',         'Portugal'],
  [66, art('2026-06-27', 22), 'RD Congo',         'Uzbekistán'],

  // GRUPO L
  [67, art('2026-06-17', 22), 'Inglaterra',       'Ghana'],
  [68, art('2026-06-18', 1),  'Croacia',          'Panamá'],
  [69, art('2026-06-23', 19), 'Inglaterra',       'Croacia'],
  [70, art('2026-06-23', 22), 'Panamá',           'Ghana'],
  [71, art('2026-06-27', 16), 'Panamá',           'Inglaterra'],
  [72, art('2026-06-27', 16), 'Croacia',          'Ghana'],
];

// Knockout stage dates (UTC) — times are approximate midday/afternoon local
const knockoutMatches = [
  // 16avos de Final (Jun 28 – Jul 4)
  [73,  '2026-06-28T19:00:00Z', '16avos de Final'],
  [74,  '2026-06-28T22:00:00Z', '16avos de Final'],
  [75,  '2026-06-29T16:00:00Z', '16avos de Final'],
  [76,  '2026-06-29T19:00:00Z', '16avos de Final'],
  [77,  '2026-06-29T22:00:00Z', '16avos de Final'],
  [78,  '2026-06-30T16:00:00Z', '16avos de Final'],
  [79,  '2026-06-30T19:00:00Z', '16avos de Final'],
  [80,  '2026-06-30T22:00:00Z', '16avos de Final'],
  [81,  '2026-07-01T19:00:00Z', '16avos de Final'],
  [82,  '2026-07-01T22:00:00Z', '16avos de Final'],
  [83,  '2026-07-02T19:00:00Z', '16avos de Final'],
  [84,  '2026-07-02T22:00:00Z', '16avos de Final'],
  [85,  '2026-07-03T19:00:00Z', '16avos de Final'],
  [86,  '2026-07-03T22:00:00Z', '16avos de Final'],
  [87,  '2026-07-04T19:00:00Z', '16avos de Final'],
  [88,  '2026-07-04T22:00:00Z', '16avos de Final'],
  // Octavos de Final (Jul 5-8)
  [89,  '2026-07-05T19:00:00Z', 'Octavos de Final'],
  [90,  '2026-07-05T22:00:00Z', 'Octavos de Final'],
  [91,  '2026-07-06T19:00:00Z', 'Octavos de Final'],
  [92,  '2026-07-06T22:00:00Z', 'Octavos de Final'],
  [93,  '2026-07-07T19:00:00Z', 'Octavos de Final'],
  [94,  '2026-07-07T22:00:00Z', 'Octavos de Final'],
  [95,  '2026-07-08T19:00:00Z', 'Octavos de Final'],
  [96,  '2026-07-08T22:00:00Z', 'Octavos de Final'],
  // Cuartos de Final (Jul 9-11)
  [97,  '2026-07-09T22:00:00Z', 'Cuartos de Final'],
  [98,  '2026-07-10T22:00:00Z', 'Cuartos de Final'],
  [99,  '2026-07-11T19:00:00Z', 'Cuartos de Final'],
  [100, '2026-07-11T22:00:00Z', 'Cuartos de Final'],
  // Semifinales (Jul 14-15)
  [101, '2026-07-14T22:00:00Z', 'Semifinal'],
  [102, '2026-07-15T22:00:00Z', 'Semifinal'],
  // Tercer Puesto (Jul 18)
  [103, '2026-07-18T19:00:00Z', 'Tercer Puesto'],
  // Final (Jul 19)
  [104, '2026-07-19T19:00:00Z', 'Final'],
];

async function run() {
  const { data: teams } = await supabase.from('teams').select('id, name');
  const teamMap = {};
  teams.forEach(t => teamMap[t.name] = t.id);

  let errors = 0;

  console.log("=== Updating Group Stage matches ===");
  for (const [id, kickoff, homeName, awayName] of groupMatches) {
    const homeId = teamMap[homeName];
    const awayId = teamMap[awayName];
    if (!homeId) { console.error(`Team not found: ${homeName}`); errors++; continue; }
    if (!awayId) { console.error(`Team not found: ${awayName}`); errors++; continue; }

    const { error } = await supabase.from('matches').update({
      kickoff_time: kickoff,
      home_team_id: homeId,
      away_team_id: awayId
    }).eq('id', id);

    if (error) { console.error(`Error updating match ${id}:`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log('\nGroup stage done!');

  console.log("=== Updating Knockout matches ===");
  for (const [id, kickoff, phase] of knockoutMatches) {
    const { error } = await supabase.from('matches').update({
      kickoff_time: kickoff,
      phase: phase
    }).eq('id', id);

    if (error) { console.error(`Error updating match ${id}:`, error.message); errors++; }
    else process.stdout.write('.');
  }
  console.log('\nKnockout done!');

  console.log(`\nTotal errors: ${errors}`);
  
  // Verify first few group matches
  const { data: verify } = await supabase.from('matches')
    .select('id, kickoff_time, home:teams!home_team_id(name), away:teams!away_team_id(name)')
    .in('id', [1, 2, 3, 4])
    .order('id');

  console.log('\nVerification (IDs 1-4):');
  verify.forEach(m => {
    const d = new Date(m.kickoff_time);
    const artTime = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    console.log(`M${m.id}: ${artTime.toISOString().replace('T',' ').substring(0,16)} ART | ${m.home?.name} vs ${m.away?.name}`);
  });
}

run();
