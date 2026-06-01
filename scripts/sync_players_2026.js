const { createClient } = require('@supabase/supabase-js');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const { data: teams, error } = await supabase.from('teams').select('id, name, flag');
    if (error) throw error;
    
    console.log(`Found ${teams.length} teams in DB`);
    
    await supabase.from('players').delete().neq('id', 0);
    console.log('Cleared old players table');
    
    let totalPlayers = 0;
    
    for (const team of teams) {
      if (!team.flag) continue;
      
      const parts = team.flag.split('/');
      // Flag URL is https://api.promiedos.com.ar/images/team/cdhi/1
      // or https://www.promiedos.com.ar/images/teams/cdhi.png
      let promiedosId = '';
      if (team.flag.includes('/team/')) {
        promiedosId = parts[parts.length - 2]; // cdhi
      } else {
        promiedosId = parts[parts.length - 1].split('.')[0];
      }
      
      const url = `https://www.promiedos.com.ar/team/x/${promiedosId}`;
      const html = await fetchHtml(url);
      
      const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (!match) {
        console.log(`No NEXT_DATA for ${team.name} (${promiedosId})`);
        continue;
      }
      
      const data = JSON.parse(match[1]);
      const squad = data.props?.pageProps?.data?.squad;
      
      if (squad && squad.groups) {
        const playersToInsert = [];
        
        squad.groups.forEach(g => {
          if (g.rows) {
            g.rows.forEach(row => {
              const obj = row.entity.object;
              if (obj.is_staff) return;
              
              playersToInsert.push({
                name: obj.name,
                team_id: team.id,
                goals: 0,
                promiedos_id: obj.sname || obj.name
              });
            });
          }
        });
        
        if (playersToInsert.length > 0) {
          const { error: insertError } = await supabase.from('players').insert(playersToInsert);
          if (insertError) {
             console.error(`Error inserting players for ${team.name}:`, insertError);
          } else {
             console.log(`Inserted ${playersToInsert.length} players for ${team.name}`);
             totalPlayers += playersToInsert.length;
          }
        } else {
          console.log(`No players found in squad data for ${team.name}`);
        }
      } else {
        console.log(`No squad structure for ${team.name}`);
      }
      
      await new Promise(r => setTimeout(r, 200));
    }
    
    console.log(`\nDONE! Inserted ${totalPlayers} players in total.`);
  } catch(e) {
    console.error(e);
  }
}
run();
