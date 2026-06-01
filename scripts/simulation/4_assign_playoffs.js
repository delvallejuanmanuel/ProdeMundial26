import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FIRST_SECOND_MAP = {
  'Grupo A': { first: { matchId: 79, position: 'home' }, second: { matchId: 73, position: 'home' } },
  'Grupo B': { first: { matchId: 85, position: 'home' }, second: { matchId: 73, position: 'away' } },
  'Grupo C': { first: { matchId: 76, position: 'home' }, second: { matchId: 75, position: 'away' } },
  'Grupo D': { first: { matchId: 81, position: 'home' }, second: { matchId: 88, position: 'home' } },
  'Grupo E': { first: { matchId: 74, position: 'home' }, second: { matchId: 78, position: 'home' } },
  'Grupo F': { first: { matchId: 75, position: 'home' }, second: { matchId: 76, position: 'away' } },
  'Grupo G': { first: { matchId: 82, position: 'home' }, second: { matchId: 88, position: 'away' } },
  'Grupo H': { first: { matchId: 84, position: 'home' }, second: { matchId: 86, position: 'away' } },
  'Grupo I': { first: { matchId: 77, position: 'home' }, second: { matchId: 78, position: 'away' } },
  'Grupo J': { first: { matchId: 86, position: 'home' }, second: { matchId: 84, position: 'away' } },
  'Grupo K': { first: { matchId: 87, position: 'home' }, second: { matchId: 83, position: 'home' } },
  'Grupo L': { first: { matchId: 80, position: 'home' }, second: { matchId: 83, position: 'away' } },
};

const THIRDS_MATCHES = [74, 77, 79, 80, 81, 82, 85, 87];

async function assignPlayoffs() {
  console.log("Calculando clasificados y asignando playoffs...");

  // 1. Obtener posiciones
  const { data: standings, error } = await supabase
    .from('v_group_standings')
    .select('*')
    .order('points', { ascending: false })
    .order('goal_diff', { ascending: false })
    .order('goals_for', { ascending: false });

  if (error) {
    console.error("Error obteniendo posiciones:", error);
    process.exit(1);
  }

  // Agrupar por grupo
  const groups = {};
  for (const s of standings) {
    if (!groups[s.group_name]) groups[s.group_name] = [];
    groups[s.group_name].push(s);
  }

  const updates = {}; // matchId -> { home_team_id, away_team_id }
  const ensureMatch = (id) => { if(!updates[id]) updates[id] = {}; };

  const thirds = [];

  // 2. Asignar 1ros y 2dos
  for (const [groupName, teams] of Object.entries(groups)) {
    const first = teams[0];
    const second = teams[1];
    const third = teams[2];

    const map = FIRST_SECOND_MAP[groupName];
    if (map) {
      ensureMatch(map.first.matchId);
      updates[map.first.matchId][map.first.position === 'home' ? 'home_team_id' : 'away_team_id'] = first.team_id;
      
      ensureMatch(map.second.matchId);
      updates[map.second.matchId][map.second.position === 'home' ? 'home_team_id' : 'away_team_id'] = second.team_id;
    }

    if (third) thirds.push(third);
  }

  // Ordenar los terceros para sacar los 8 mejores
  thirds.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
    return b.goals_for - a.goals_for;
  });

  const top8Thirds = thirds.slice(0, 8);
  console.log("Los 8 mejores terceros son:", top8Thirds.map(t => `${t.name} (${t.group_name})`).join(', '));

  // 3. Asignar a los 8 mejores terceros a los slots restantes (algoritmo greedy con backtracking simple)
  // Necesitamos saber qué grupo está esperando en cada matchId
  const slots = THIRDS_MATCHES.map(id => {
    // El home_team_id de este partido es el 1º de algún grupo.
    // Buscamos qué grupo mandó su 1º a este partido.
    let hostGroup = '';
    for (const [gName, map] of Object.entries(FIRST_SECOND_MAP)) {
      if (map.first.matchId === id) {
        hostGroup = gName;
        break;
      }
    }
    return { matchId: id, hostGroup };
  });

  function solve(index, currentAssignment) {
    if (index === slots.length) return currentAssignment;

    const slot = slots[index];
    for (let i = 0; i < top8Thirds.length; i++) {
      const t = top8Thirds[i];
      if (!currentAssignment.some(a => a.team.team_id === t.team_id)) {
        // Regla: No pueden jugar contra alguien de su propio grupo
        if (t.group_name !== slot.hostGroup) {
          const res = solve(index + 1, [...currentAssignment, { slot, team: t }]);
          if (res) return res;
        }
      }
    }
    return null; // backtrace
  }

  const assignment = solve(0, []);
  if (!assignment) {
    console.warn("No se encontró una asignación perfecta de terceros que evite cruces del mismo grupo. Se asignarán aleatoriamente.");
    // Fallback absoluto
    for (let i = 0; i < slots.length; i++) {
      ensureMatch(slots[i].matchId);
      updates[slots[i].matchId]['away_team_id'] = top8Thirds[i].team_id;
    }
  } else {
    for (const a of assignment) {
      ensureMatch(a.slot.matchId);
      updates[a.slot.matchId]['away_team_id'] = a.team.team_id;
    }
  }

  // 4. Guardar en DB
  console.log("Guardando los 16avos de final en la base de datos...");
  let count = 0;
  for (const [matchId, data] of Object.entries(updates)) {
    const { error } = await supabase.from('matches').update(data).eq('id', matchId);
    if (error) {
      console.error(`Error guardando partido ${matchId}:`, error);
    } else {
      count++;
    }
  }

  console.log(`¡Listo! Se actualizaron ${count} partidos de playoffs.`);
}

assignPlayoffs().catch(console.error);
