import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractNextData() {
  const url = 'https://www.promiedos.com.ar/league/fifa-world-cup/fjda';
  console.log(`Fetching Promiedos from ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
  if (!match) throw new Error('No NEXT_DATA found');
  return JSON.parse(match[1]).props.pageProps.data;
}

async function run() {
  try {
    const data = await extractNextData();
    console.log('Successfully fetched Promiedos data.');

    // 1. Map teams using the 'flag' column in our DB
    const { data: dbTeams, error: dbTeamsError } = await supabase.from('teams').select('*');
    if (dbTeamsError) throw dbTeamsError;

    const promiedosToDbTeam = {};
    for (const team of dbTeams) {
      if (team.flag) {
        // e.g. https://api.promiedos.com.ar/images/team/cdhi/1 -> cdhi
        const parts = team.flag.split('/');
        if (parts.length > 5) {
          const promiedosId = parts[5];
          promiedosToDbTeam[promiedosId] = team.id;
        }
      }
    }

    // 2. Process Matches
    const games = data.games.filters;
    let matchesCount = 0;
    for (const filter of games) {
      if (!filter.games) continue;
      for (const game of filter.games) {
        if (!game.teams || game.teams.length < 2) continue;
        
        const homeTeamId = promiedosToDbTeam[game.teams[0].id];
        const awayTeamId = promiedosToDbTeam[game.teams[1].id];
        
        if (!homeTeamId || !awayTeamId) {
          console.log(`Skipping match ${game.teams[0].name} vs ${game.teams[1].name} due to missing team mapping.`);
          continue;
        }

        // Parse date "11-06-2026 16:00" -> ISO string
        // Note: JS Date parsing might be tricky, let's parse it manually.
        // Format is DD-MM-YYYY HH:MM
        const parts = game.start_time.split(' ');
        const dateParts = parts[0].split('-');
        const timeParts = parts[1].split(':');
        const kickoff = new Date(Date.UTC(
          parseInt(dateParts[2]), 
          parseInt(dateParts[1]) - 1, 
          parseInt(dateParts[0]),
          parseInt(timeParts[0]) + 3, // Assuming Argentina timezone (UTC-3), we convert to UTC
          parseInt(timeParts[1])
        )).toISOString();

        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('home_team_id', homeTeamId)
          .eq('away_team_id', awayTeamId)
          .eq('phase', filter.name)
          .single();

        const matchData = {
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          phase: filter.name,
          kickoff_time: kickoff,
          status: game.status.name === 'Prog.' ? 'TIMED' : (game.status.name === 'Fin' ? 'FINISHED' : 'IN_PLAY'),
          home_score: game.winner !== -1 ? game.teams[0].goals : null,
          away_score: game.winner !== -1 ? game.teams[1].goals : null,
          promiedos_id: game.id
        };

        if (existingMatch) {
          await supabase.from('matches').update(matchData).eq('id', existingMatch.id);
        } else {
          await supabase.from('matches').insert([matchData]);
        }
        matchesCount++;
      }
    }
    console.log(`Processed ${matchesCount} matches.`);

    // 3. Process Players (Goleadores)
    const playersTable = data.players_statistics.tables.find((t) => t.name === 'Goles');
    let playersCount = 0;
    if (playersTable && playersTable.rows) {
      for (const row of playersTable.rows) {
        const playerObj = row.entity.object;
        const goalsValue = row.values.find((v) => v.key === 'Goals')?.value;
        const goals = parseInt(goalsValue) || 0;
        
        const teamId = promiedosToDbTeam[playerObj.team_id];
        if (!teamId) continue;

        const playerData = {
          name: playerObj.name,
          team_id: teamId,
          promiedos_id: playerObj.sname || playerObj.name,
          goals: goals
        };

        const { data: existingPlayer } = await supabase
          .from('players')
          .select('id')
          .eq('promiedos_id', playerData.promiedos_id)
          .single();

        if (existingPlayer) {
          await supabase.from('players').update(playerData).eq('id', existingPlayer.id);
        } else {
          await supabase.from('players').insert([playerData]);
        }
        playersCount++;
      }
    }
    console.log(`Processed ${playersCount} top scorers.`);

  } catch (err) {
    console.error('Error during Promiedos seed:', err);
  }
}

run();
