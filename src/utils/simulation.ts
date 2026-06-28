export interface QualifierEntry {
  name: string;
  flag: string;
  isSimulated: boolean;
}

export interface SimulationResult {
  qualifierMap: Map<string, QualifierEntry>;
}

export function computePlayoffSimulation(
  playoffMatches: Array<{
    id: number;
    phase: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
    home_team_id: number | null;
    away_team_id: number | null;
    winner_by_penalties_team_id: number | null;
    home_team: { id: number; name: string; flag: string } | { id: number; name: string; flag: string }[] | null;
    away_team: { id: number; name: string; flag: string } | { id: number; name: string; flag: string }[] | null;
  }>,
  userPredictions: Array<{
    match_id: number;
    predicted_home_score: number | null;
    predicted_away_score: number | null;
    predicted_penalties_winner_team_id: number | null;
  }>
): SimulationResult {
  const predMap = new Map(userPredictions.map(p => [p.match_id, p]));
  const matchMap = new Map(playoffMatches.map(m => [m.id, m]));
  const qualifierMap = new Map<string, QualifierEntry>();

  const getTeam = (raw: any) => (Array.isArray(raw) ? raw[0] : raw);

  // 1. Map R32 initial teams (matches 73-88)
  for (let i = 73; i <= 88; i++) {
    const m = matchMap.get(i);
    if (m) {
      const h = getTeam(m.home_team);
      const a = getTeam(m.away_team);
      if (h) qualifierMap.set(`${i}-home`, { name: h.name, flag: h.flag, isSimulated: false });
      if (a) qualifierMap.set(`${i}-away`, { name: a.name, flag: a.flag, isSimulated: false });
    }
  }

  // 2. We need a way to resolve winners hierarchically.
  // The bracket dependencies are known:
  const dependencies = [
    // Octavos
    { id: 89, h: 74, a: 77 }, { id: 90, h: 73, a: 75 }, { id: 91, h: 76, a: 78 }, { id: 92, h: 79, a: 80 },
    { id: 93, h: 83, a: 84 }, { id: 94, h: 81, a: 82 }, { id: 95, h: 86, a: 88 }, { id: 96, h: 85, a: 87 },
    // Cuartos
    { id: 97, h: 89, a: 90 }, { id: 98, h: 93, a: 94 }, { id: 99, h: 91, a: 92 }, { id: 100, h: 95, a: 96 },
    // Semis
    { id: 101, h: 97, a: 98 }, { id: 102, h: 99, a: 100 },
    // Final
    { id: 104, h: 101, a: 102 },
    // Tercer Puesto (Losers of Semis)
    { id: 103, h: -101, a: -102 } // Negative denotes loser
  ];

  // We'll maintain a state of who is currently occupying each slot
  // teamState maps `matchId` -> { home: teamObj, away: teamObj }
  const matchTeams = new Map<number, { 
    home: { id: number, name: string, flag: string, isSimulated: boolean } | null, 
    away: { id: number, name: string, flag: string, isSimulated: boolean } | null 
  }>();

  // Initialize R32
  for (let i = 73; i <= 88; i++) {
    const m = matchMap.get(i);
    if (m) {
      const h = getTeam(m.home_team);
      const a = getTeam(m.away_team);
      matchTeams.set(i, {
        home: h ? { id: h.id, name: h.name, flag: h.flag, isSimulated: false } : null,
        away: a ? { id: a.id, name: a.name, flag: a.flag, isSimulated: false } : null
      });
    }
  }

  const getWinner = (matchId: number): { id: number, name: string, flag: string, isSimulated: boolean } | null => {
    const m = matchMap.get(matchId);
    const p = predMap.get(matchId);
    const teams = matchTeams.get(matchId);
    if (!teams || !teams.home || !teams.away) return null;

    // Use prediction if available
    if (p && p.predicted_home_score !== null && p.predicted_away_score !== null) {
      if (p.predicted_home_score > p.predicted_away_score) return { ...teams.home, isSimulated: true };
      if (p.predicted_away_score > p.predicted_home_score) return { ...teams.away, isSimulated: true };
      
      // Tie -> use penalties prediction
      if (p.predicted_penalties_winner_team_id === teams.home.id) return { ...teams.home, isSimulated: true };
      if (p.predicted_penalties_winner_team_id === teams.away.id) return { ...teams.away, isSimulated: true };
    }
    
    // Fallback to real result if match finished
    if (m && m.status === 'finished' && m.home_score !== null && m.away_score !== null) {
      if (m.home_score > m.away_score) return { ...teams.home, isSimulated: false };
      if (m.away_score > m.home_score) return { ...teams.away, isSimulated: false };
      
      // Tie -> use real penalties
      if (m.winner_by_penalties_team_id === teams.home.id) return { ...teams.home, isSimulated: false };
      if (m.winner_by_penalties_team_id === teams.away.id) return { ...teams.away, isSimulated: false };
    }

    return null; // unresolved
  };

  const getLoser = (matchId: number): { id: number, name: string, flag: string, isSimulated: boolean } | null => {
    const m = matchMap.get(matchId);
    const p = predMap.get(matchId);
    const teams = matchTeams.get(matchId);
    if (!teams || !teams.home || !teams.away) return null;

    // Use prediction if available
    if (p && p.predicted_home_score !== null && p.predicted_away_score !== null) {
      if (p.predicted_home_score > p.predicted_away_score) return { ...teams.away, isSimulated: true };
      if (p.predicted_away_score > p.predicted_home_score) return { ...teams.home, isSimulated: true };
      
      if (p.predicted_penalties_winner_team_id === teams.home.id) return { ...teams.away, isSimulated: true };
      if (p.predicted_penalties_winner_team_id === teams.away.id) return { ...teams.home, isSimulated: true };
    }
    
    // Fallback to real result if match finished
    if (m && m.status === 'finished' && m.home_score !== null && m.away_score !== null) {
      if (m.home_score > m.away_score) return { ...teams.away, isSimulated: false };
      if (m.away_score > m.home_score) return { ...teams.home, isSimulated: false };
      
      if (m.winner_by_penalties_team_id === teams.home.id) return { ...teams.away, isSimulated: false };
      if (m.winner_by_penalties_team_id === teams.away.id) return { ...teams.home, isSimulated: false };
    }

    return null;
  };

  // Evaluate dependencies sequentially (they are topologically sorted)
  for (const dep of dependencies) {
    const homeTeam = dep.h < 0 ? getLoser(Math.abs(dep.h)) : getWinner(dep.h);
    const awayTeam = dep.a < 0 ? getLoser(Math.abs(dep.a)) : getWinner(dep.a);

    matchTeams.set(dep.id, {
      home: homeTeam,
      away: awayTeam
    });

    // Populate qualifierMap for UI visualization
    if (homeTeam) {
      const code = dep.h < 0 ? `RU${Math.abs(dep.h)}` : `W${dep.h}`;
      qualifierMap.set(code, { name: homeTeam.name, flag: homeTeam.flag, isSimulated: homeTeam.isSimulated });
    }
    if (awayTeam) {
      const code = dep.a < 0 ? `RU${Math.abs(dep.a)}` : `W${dep.a}`;
      qualifierMap.set(code, { name: awayTeam.name, flag: awayTeam.flag, isSimulated: awayTeam.isSimulated });
    }
  }

  return { qualifierMap };
}
