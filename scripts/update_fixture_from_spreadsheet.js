const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Convert ART time to UTC ISO string
// ART = UTC-3, so UTC = ART + 3 hours
function artToUTC(dayStr, timeStr) {
  // dayStr: "11 de junio" -> day=11, month=6
  const dayNum = parseInt(dayStr.split(' ')[0]);
  const month = 6; // all matches are in June/July
  // Handle July if needed
  const actualMonth = dayNum > 28 && month === 6 ? 6 : 6; // all are June here

  const [hourStr, minStr] = timeStr.replace('hs', '').split(':');
  let h = parseInt(hourStr);
  let m = parseInt(minStr || '0');

  let utcH = h + 3;
  let utcDay = dayNum;
  let utcMonth = month;

  if (utcH >= 24) {
    utcH -= 24;
    utcDay += 1;
    // Handle end of June -> July
    if (utcDay > 30 && utcMonth === 6) { utcDay = 1; utcMonth = 7; }
  }

  return `2026-${String(utcMonth).padStart(2,'0')}-${String(utcDay).padStart(2,'0')}T${String(utcH).padStart(2,'0')}:${String(m).padStart(2,'0')}:00Z`;
}

// Exact data from user's spreadsheet (ART times)
const fixtureData = [
  // GRUPO A
  { grupo: 'Grupo A', dia: '11 de junio', hora: '16:00', local: 'México',              visitante: 'Sudáfrica' },
  { grupo: 'Grupo A', dia: '11 de junio', hora: '23:00', local: 'Corea del Sur',       visitante: 'Republica Checa' },
  { grupo: 'Grupo A', dia: '18 de junio', hora: '13:00', local: 'Republica Checa',     visitante: 'Sudáfrica' },
  { grupo: 'Grupo A', dia: '18 de junio', hora: '22:00', local: 'México',              visitante: 'Corea del Sur' },
  { grupo: 'Grupo A', dia: '24 de junio', hora: '22:00', local: 'Sudáfrica',           visitante: 'Corea del Sur' },
  { grupo: 'Grupo A', dia: '24 de junio', hora: '22:00', local: 'Republica Checa',     visitante: 'México' },

  // GRUPO B
  { grupo: 'Grupo B', dia: '12 de junio', hora: '16:00', local: 'Canadá',              visitante: 'Bosnia Herzegovina' },
  { grupo: 'Grupo B', dia: '13 de junio', hora: '16:00', local: 'Qatar',               visitante: 'Suiza' },
  { grupo: 'Grupo B', dia: '18 de junio', hora: '16:00', local: 'Suiza',               visitante: 'Bosnia Herzegovina' },
  { grupo: 'Grupo B', dia: '18 de junio', hora: '19:00', local: 'Canadá',              visitante: 'Qatar' },
  { grupo: 'Grupo B', dia: '24 de junio', hora: '16:00', local: 'Bosnia Herzegovina',  visitante: 'Qatar' },
  { grupo: 'Grupo B', dia: '24 de junio', hora: '16:00', local: 'Suiza',               visitante: 'Canadá' },

  // GRUPO C
  { grupo: 'Grupo C', dia: '13 de junio', hora: '19:00', local: 'Brasil',              visitante: 'Marruecos' },
  { grupo: 'Grupo C', dia: '13 de junio', hora: '22:00', local: 'Haití',               visitante: 'Escocia' },
  { grupo: 'Grupo C', dia: '19 de junio', hora: '19:00', local: 'Escocia',             visitante: 'Marruecos' },
  { grupo: 'Grupo C', dia: '19 de junio', hora: '22:00', local: 'Brasil',              visitante: 'Haití' },
  { grupo: 'Grupo C', dia: '24 de junio', hora: '19:00', local: 'Escocia',             visitante: 'Brasil' },
  { grupo: 'Grupo C', dia: '24 de junio', hora: '19:00', local: 'Marruecos',           visitante: 'Haití' },

  // GRUPO D
  { grupo: 'Grupo D', dia: '12 de junio', hora: '22:00', local: 'Estados Unidos',      visitante: 'Paraguay' },
  { grupo: 'Grupo D', dia: '14 de junio', hora: '01:00', local: 'Australia',           visitante: 'Turquía' },
  { grupo: 'Grupo D', dia: '19 de junio', hora: '16:00', local: 'Estados Unidos',      visitante: 'Australia' },
  { grupo: 'Grupo D', dia: '20 de junio', hora: '00:00', local: 'Turquía',             visitante: 'Paraguay' },
  { grupo: 'Grupo D', dia: '25 de junio', hora: '23:00', local: 'Paraguay',            visitante: 'Australia' },
  { grupo: 'Grupo D', dia: '25 de junio', hora: '23:00', local: 'Turquía',             visitante: 'Estados Unidos' },

  // GRUPO E
  { grupo: 'Grupo E', dia: '14 de junio', hora: '14:00', local: 'Alemania',            visitante: 'Curazao' },
  { grupo: 'Grupo E', dia: '14 de junio', hora: '20:00', local: 'Costa de Marfil',     visitante: 'Ecuador' },
  { grupo: 'Grupo E', dia: '20 de junio', hora: '17:00', local: 'Alemania',            visitante: 'Costa de Marfil' },
  { grupo: 'Grupo E', dia: '20 de junio', hora: '21:00', local: 'Ecuador',             visitante: 'Curazao' },
  { grupo: 'Grupo E', dia: '25 de junio', hora: '17:00', local: 'Curazao',             visitante: 'Costa de Marfil' },
  { grupo: 'Grupo E', dia: '25 de junio', hora: '17:00', local: 'Ecuador',             visitante: 'Alemania' },

  // GRUPO F
  { grupo: 'Grupo F', dia: '14 de junio', hora: '17:00', local: 'Países Bajos',        visitante: 'Japón' },
  { grupo: 'Grupo F', dia: '14 de junio', hora: '23:00', local: 'Suecia',              visitante: 'Túnez' },
  { grupo: 'Grupo F', dia: '20 de junio', hora: '14:00', local: 'Países Bajos',        visitante: 'Suecia' },
  { grupo: 'Grupo F', dia: '21 de junio', hora: '01:00', local: 'Túnez',               visitante: 'Japón' },
  { grupo: 'Grupo F', dia: '25 de junio', hora: '20:00', local: 'Japón',               visitante: 'Suecia' },
  { grupo: 'Grupo F', dia: '25 de junio', hora: '20:00', local: 'Túnez',               visitante: 'Países Bajos' },

  // GRUPO G
  { grupo: 'Grupo G', dia: '15 de junio', hora: '16:00', local: 'Bélgica',             visitante: 'Egipto' },
  { grupo: 'Grupo G', dia: '15 de junio', hora: '22:00', local: 'Irán',                visitante: 'Nueva Zelanda' },
  { grupo: 'Grupo G', dia: '21 de junio', hora: '18:00', local: 'Bélgica',             visitante: 'Irán' },
  { grupo: 'Grupo G', dia: '21 de junio', hora: '22:00', local: 'Nueva Zelanda',       visitante: 'Egipto' },
  { grupo: 'Grupo G', dia: '27 de junio', hora: '00:00', local: 'Nueva Zelanda',       visitante: 'Bélgica' },
  { grupo: 'Grupo G', dia: '27 de junio', hora: '00:00', local: 'Egipto',              visitante: 'Irán' },

  // GRUPO H
  { grupo: 'Grupo H', dia: '15 de junio', hora: '13:00', local: 'España',              visitante: 'Cabo Verde' },
  { grupo: 'Grupo H', dia: '15 de junio', hora: '19:00', local: 'Arabia Saudita',      visitante: 'Uruguay' },
  { grupo: 'Grupo H', dia: '21 de junio', hora: '13:00', local: 'España',              visitante: 'Arabia Saudita' },
  { grupo: 'Grupo H', dia: '21 de junio', hora: '19:00', local: 'Uruguay',             visitante: 'Cabo Verde' },
  { grupo: 'Grupo H', dia: '26 de junio', hora: '21:00', local: 'Cabo Verde',          visitante: 'Arabia Saudita' },
  { grupo: 'Grupo H', dia: '26 de junio', hora: '21:00', local: 'Uruguay',             visitante: 'España' },

  // GRUPO I
  { grupo: 'Grupo I', dia: '16 de junio', hora: '16:00', local: 'Francia',             visitante: 'Senegal' },
  { grupo: 'Grupo I', dia: '16 de junio', hora: '19:00', local: 'Irak',                visitante: 'Noruega' },
  { grupo: 'Grupo I', dia: '22 de junio', hora: '18:00', local: 'Francia',             visitante: 'Irak' },
  { grupo: 'Grupo I', dia: '22 de junio', hora: '21:00', local: 'Noruega',             visitante: 'Senegal' },
  { grupo: 'Grupo I', dia: '26 de junio', hora: '16:00', local: 'Senegal',             visitante: 'Irak' },
  { grupo: 'Grupo I', dia: '26 de junio', hora: '16:00', local: 'Noruega',             visitante: 'Francia' },

  // GRUPO J
  { grupo: 'Grupo J', dia: '16 de junio', hora: '22:00', local: 'Argentina',           visitante: 'Argelia' },
  { grupo: 'Grupo J', dia: '17 de junio', hora: '01:00', local: 'Austria',             visitante: 'Jordania' },
  { grupo: 'Grupo J', dia: '22 de junio', hora: '14:00', local: 'Argentina',           visitante: 'Austria' },
  { grupo: 'Grupo J', dia: '23 de junio', hora: '00:00', local: 'Jordania',            visitante: 'Argelia' },
  { grupo: 'Grupo J', dia: '27 de junio', hora: '23:00', local: 'Argelia',             visitante: 'Austria' },
  { grupo: 'Grupo J', dia: '27 de junio', hora: '23:00', local: 'Jordania',            visitante: 'Argentina' },

  // GRUPO K
  { grupo: 'Grupo K', dia: '17 de junio', hora: '14:00', local: 'Portugal',            visitante: 'RD Congo' },
  { grupo: 'Grupo K', dia: '17 de junio', hora: '23:00', local: 'Uzbekistán',          visitante: 'Colombia' },
  { grupo: 'Grupo K', dia: '23 de junio', hora: '14:00', local: 'Portugal',            visitante: 'Uzbekistán' },
  { grupo: 'Grupo K', dia: '23 de junio', hora: '23:00', local: 'Colombia',            visitante: 'RD Congo' },
  { grupo: 'Grupo K', dia: '27 de junio', hora: '20:30', local: 'RD Congo',            visitante: 'Uzbekistán' },
  { grupo: 'Grupo K', dia: '27 de junio', hora: '20:30', local: 'Colombia',            visitante: 'Portugal' },

  // GRUPO L
  { grupo: 'Grupo L', dia: '17 de junio', hora: '17:00', local: 'Inglaterra',          visitante: 'Croacia' },
  { grupo: 'Grupo L', dia: '17 de junio', hora: '20:00', local: 'Ghana',               visitante: 'Panamá' },
  { grupo: 'Grupo L', dia: '23 de junio', hora: '17:00', local: 'Inglaterra',          visitante: 'Ghana' },
  { grupo: 'Grupo L', dia: '23 de junio', hora: '20:00', local: 'Panamá',              visitante: 'Croacia' },
  { grupo: 'Grupo L', dia: '27 de junio', hora: '18:00', local: 'Croacia',             visitante: 'Ghana' },
  { grupo: 'Grupo L', dia: '27 de junio', hora: '18:00', local: 'Panamá',              visitante: 'Inglaterra' },
];

async function run() {
  // 1. Fetch all teams
  const { data: teams, error: teamsErr } = await supabase.from('teams').select('id, name');
  if (teamsErr) { console.error('Teams error:', teamsErr); return; }

  // Build name->id map (with aliases for name variations)
  const nameAliases = {
    'República de Corea': 'Corea del Sur',
    'Bosnia y Herzegovina': 'Bosnia Herzegovina',
    'Arabia Saudí': 'Arabia Saudita',
    'RD del Congo': 'RD Congo',
  };

  const teamMap = {};
  teams.forEach(t => { teamMap[t.name] = t.id; });

  function getTeamId(name) {
    const resolved = nameAliases[name] || name;
    const id = teamMap[resolved];
    if (!id) console.error(`  !! Team not found: "${name}" (resolved: "${resolved}")`);
    return id;
  }

  // 2. Fetch all group matches
  const { data: matches } = await supabase
    .from('matches')
    .select('id, phase, home_team_id, away_team_id')
    .like('phase', 'Grupo %');

  // Build lookup: "Grupo X:teamIdA:teamIdB" -> matchId (regardless of home/away order)
  function matchKey(phase, id1, id2) {
    return `${phase}:${[id1, id2].sort().join(':')}`;
  }
  const matchLookup = {};
  matches.forEach(m => {
    const k = matchKey(m.phase, m.home_team_id, m.away_team_id);
    matchLookup[k] = m.id;
  });

  let updated = 0;
  let errors = 0;

  console.log('=== Updating group matches from spreadsheet ===\n');

  for (const row of fixtureData) {
    const kickoff = artToUTC(row.dia, row.hora);
    const homeId = getTeamId(row.local);
    const awayId = getTeamId(row.visitante);

    if (!homeId || !awayId) { errors++; continue; }

    const k = matchKey(row.grupo, homeId, awayId);
    const matchId = matchLookup[k];

    if (!matchId) {
      console.error(`  !! Match not found in DB: ${row.grupo} | ${row.local} vs ${row.visitante}`);
      errors++;
      continue;
    }

    const { error } = await supabase.from('matches').update({
      kickoff_time: kickoff,
      home_team_id: homeId,
      away_team_id: awayId,
    }).eq('id', matchId);

    if (error) {
      console.error(`  Error updating match ${matchId}:`, error.message);
      errors++;
    } else {
      // Show in ART for verification
      const utcDate = new Date(kickoff);
      const artDate = new Date(utcDate.getTime() - 3 * 60 * 60 * 1000);
      const artStr = artDate.toISOString().replace('T', ' ').substring(0, 16);
      console.log(`  ✓ M${matchId} | ${row.grupo} | ${artStr} ART | ${row.local} vs ${row.visitante}`);
      updated++;
    }
  }

  console.log(`\n=== Done: ${updated} updated, ${errors} errors ===`);
}

run();
