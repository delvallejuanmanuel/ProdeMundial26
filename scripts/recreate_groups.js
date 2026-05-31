const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const groupsData = {
  "Grupo A": ["Republica Checa", "Sudáfrica", "México", "Corea del Sur"],
  "Grupo B": ["Suiza", "Bosnia Herzegovina", "Canadá", "Qatar"],
  "Grupo C": ["Brasil", "Haití", "Escocia", "Marruecos"],
  "Grupo D": ["Turquía", "Paraguay", "Estados Unidos", "Australia"],
  "Grupo E": ["Alemania", "Costa de Marfil", "Curazao", "Ecuador"],
  "Grupo F": ["Países Bajos", "Suecia", "Japón", "Túnez"],
  "Grupo G": ["Bélgica", "Irán", "Egipto", "Nueva Zelanda"],
  "Grupo H": ["España", "Arabia Saudita", "Cabo Verde", "Uruguay"],
  "Grupo I": ["Francia", "Irak", "Noruega", "Senegal"],
  "Grupo J": ["Argentina", "Austria", "Jordania", "Argelia"],
  "Grupo K": ["Portugal", "Uzbekistán", "Colombia", "RD Congo"],
  "Grupo L": ["Inglaterra", "Ghana", "Croacia", "Panamá"]
};

async function run() {
  const { data: teams } = await supabase.from('teams').select('id, name');
  
  const teamMap = {};
  teams.forEach(t => teamMap[t.name] = t.id);

  const newMatches = [];
  let matchId = 1;

  for (const [groupName, teamNames] of Object.entries(groupsData)) {
    const t1 = teamMap[teamNames[0]];
    const t2 = teamMap[teamNames[1]];
    const t3 = teamMap[teamNames[2]];
    const t4 = teamMap[teamNames[3]];

    if (!t1 || !t2 || !t3 || !t4) {
      console.error(`Missing team in ${groupName}`, teamNames);
      return;
    }

    const groupMatches = [
      { home_team_id: t1, away_team_id: t2 },
      { home_team_id: t3, away_team_id: t4 },
      { home_team_id: t1, away_team_id: t3 },
      { home_team_id: t4, away_team_id: t2 },
      { home_team_id: t4, away_team_id: t1 },
      { home_team_id: t2, away_team_id: t3 }
    ];

    let matchDay = 1;
    for (let i = 0; i < groupMatches.length; i++) {
      let kickoff;
      if (i < 2) kickoff = '2026-06-11T16:00:00Z'; // Matchday 1
      else if (i < 4) kickoff = '2026-06-16T16:00:00Z'; // Matchday 2
      else kickoff = '2026-06-21T16:00:00Z'; // Matchday 3

      newMatches.push({
        id: matchId++,
        phase: groupName,
        home_team_id: groupMatches[i].home_team_id,
        away_team_id: groupMatches[i].away_team_id,
        kickoff_time: kickoff,
        status: 'pending',
        promiedos_id: null
      });
    }
  }

  // Delete existing matches < 73 just in case
  await supabase.from('matches').delete().lt('id', 73);

  const { error } = await supabase.from('matches').insert(newMatches);
  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Successfully recreated 72 group matches!");
  }
}

run();
