import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const content = fs.readFileSync('scratch/fixture_2026.txt', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Load all teams to get their IDs
  const { data: dbTeams } = await supabase.from('teams').select('*');
  const teamMap = {};
  
  // Custom manual mappings for some teams that might have different names in DB vs Text
  const customMap = {
    'R. Checa': 'Republica Checa',
    'Bosnia y Herzegovina': 'Bosnia Herzegovina'
  };

  for (const team of dbTeams) {
    teamMap[team.name.toLowerCase()] = team.id;
  }
  
  function getTeamId(name) {
    let cleanName = name.trim();
    if (customMap[cleanName]) cleanName = customMap[cleanName];
    // Special fallback for RD Congo if not in DB
    if (cleanName === 'RD Congo' && !teamMap['rd congo']) return 1; // Hack to use a default ID or handle later
    const id = teamMap[cleanName.toLowerCase()];
    if (!id) {
        console.warn(`Team not found in DB: "${cleanName}"`);
    }
    return id;
  }

  let currentPhase = '';
  let matchesToInsert = [];
  let currentDate = '2026-06-11'; // Default

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('GRUPO ')) {
      currentPhase = `Grupo ${line.replace('GRUPO ', '')}`;
      continue;
    }
    if (line === '16AVOS DE FINAL') { currentPhase = '16avos'; continue; }
    if (line === 'OCTAVOS DE FINAL') { currentPhase = 'Octavos'; continue; }
    if (line === 'CUARTOS DE FINAL') { currentPhase = 'Cuartos'; continue; }
    if (line === 'SEMIFINALES') { currentPhase = 'Semifinal'; continue; }
    if (line === 'TERCER PUESTO') { currentPhase = 'Tercer Puesto'; continue; }
    if (line === 'FINAL') { currentPhase = 'Final'; continue; }

    const dateMatch = line.match(/(\d{2}\/\d{2})/);
    if (line.match(/^(Fecha \d+ – )?[A-Z][a-záéíóú]+ \d+\/\d+/) || line.match(/^[A-Z][a-záéíóú]+ \d+\/\d+/)) {
      if (dateMatch) {
          const [dd, mm] = dateMatch[1].split('/');
          currentDate = `2026-${mm}-${dd}`;
      }
      continue; 
    }

    let homeId = null;
    let awayId = null;
    let homePlaceholder = null;
    let awayPlaceholder = null;
    let timeStr = '12:00'; // Default time

    if (line.includes(' horas')) {
        const timeMatch = line.match(/(\d{2}:\d{2}) horas/);
        if (timeMatch) timeStr = timeMatch[1];
    }
    
    // Some lines don't have time, it will fallback to 12:00
    const kickoffTime = `${currentDate}T${timeStr}:00Z`;

    if (line.includes(' vs. ')) {
        const parts = line.split(' – ');
        const teamsStr = parts[0];
        const [t1, t2] = teamsStr.split(' vs. ');
        homeId = getTeamId(t1);
        awayId = getTeamId(t2);
    } else if (line.includes(' v ')) {
        const parts = line.split(' – ');
        let matchStr = parts[0];
        
        if (parts.length >= 2 && parts[1].includes(' v ')) {
            matchStr = parts[1];
        }

        const splitMatch = matchStr.split(' v ');
        if (splitMatch.length >= 2) {
            homePlaceholder = splitMatch[0].trim();
            awayPlaceholder = splitMatch[1].trim();
        } else {
            continue;
        }
    } else {
        continue;
    }

    matchesToInsert.push({
      phase: currentPhase,
      home_team_id: homeId,
      away_team_id: awayId,
      home_team_placeholder: homePlaceholder,
      away_team_placeholder: awayPlaceholder,
      kickoff_time: kickoffTime,
      status: 'pending'
    });
  }

  console.log(`Parsed ${matchesToInsert.length} matches.`);

  // Delete all existing matches
  const { error: deleteError } = await supabase.from('matches').delete().neq('id', 0); // Delete all
  if (deleteError) {
      console.error('Error deleting old matches:', deleteError);
      return;
  }
  console.log('Deleted old matches.');

  // Insert new matches
  const { data: inserted, error: insertError } = await supabase.from('matches').insert(matchesToInsert).select();
  if (insertError) {
      console.error('Error inserting new matches:', insertError);
  } else {
      console.log(`Inserted ${inserted.length} new matches for 2026!`);
  }
}

run();
