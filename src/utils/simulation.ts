/**
 * Simulation engine: computes simulated group standings from user predictions.
 * Uses predicted scores where available, actual scores for finished matches without prediction,
 * and skips matches that are pending and unpredicted.
 * Zero DB writes — pure computation on existing data.
 */

export interface SimulatedTeam {
  team_id: number;
  name: string;
  flag: string;
  group_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}

export interface SimulatedGroup {
  group_name: string;
  teams: SimulatedTeam[];
}

export interface QualifierEntry {
  name: string;
  flag: string;
  isSimulated: boolean; // true = from user prediction, false = not predicted
}

export interface SimulationResult {
  groups: SimulatedGroup[];
  /** Map from placeholder code ("1A", "2B", "3ABCDF") to team info */
  qualifierMap: Map<string, QualifierEntry>;
  /** All 12 third-place teams, ranked best to worst */
  thirdsRanked: SimulatedTeam[];
}

// The 8 third-place slots in the bracket and which group letters can fill each
const THIRD_PLACE_SLOTS: Record<string, string[]> = {
  '3ABCDF': ['A', 'B', 'C', 'D', 'F'],
  '3CDFGH': ['C', 'D', 'F', 'G', 'H'],
  '3CEFHI': ['C', 'E', 'F', 'H', 'I'],
  '3EHIJK': ['E', 'H', 'I', 'J', 'K'],
  '3BEFIJ': ['B', 'E', 'F', 'I', 'J'],
  '3AEHIJ': ['A', 'E', 'H', 'I', 'J'],
  '3EFGIJ': ['E', 'F', 'G', 'I', 'J'],
  '3DEIJL': ['D', 'E', 'I', 'J', 'L'],
};

function teamSortKey(t: SimulatedTeam): [number, number, number, string] {
  return [t.points, t.goal_diff, t.goals_for, t.name];
}

function compareTeams(a: SimulatedTeam, b: SimulatedTeam): number {
  const ka = teamSortKey(a);
  const kb = teamSortKey(b);
  for (let i = 0; i < 3; i++) {
    if ((kb[i] as number) !== (ka[i] as number)) return (kb[i] as number) - (ka[i] as number);
  }
  return (ka[3] as string).localeCompare(kb[3] as string);
}

export function computeSimulation(
  groupMatches: Array<{
    id: number;
    phase: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
    home_team_id: number;
    away_team_id: number;
    home_team: { id: number; name: string; flag: string } | { id: number; name: string; flag: string }[] | null;
    away_team: { id: number; name: string; flag: string } | { id: number; name: string; flag: string }[] | null;
  }>,
  userPredictions: Array<{
    match_id: number;
    predicted_home_score: number | null;
    predicted_away_score: number | null;
  }>
): SimulationResult {
  const predMap = new Map(userPredictions.map(p => [p.match_id, p]));
  const teamStats = new Map<number, SimulatedTeam>();

  const getTeam = (raw: { id: number; name: string; flag: string } | { id: number; name: string; flag: string }[] | null) =>
    Array.isArray(raw) ? raw[0] : raw;

  // Initialize all teams (even those without predictions, so they appear in standings)
  for (const match of groupMatches) {
    const homeTeam = getTeam(match.home_team);
    const awayTeam = getTeam(match.away_team);
    const groupName = match.phase;

    if (homeTeam && match.home_team_id && !teamStats.has(match.home_team_id)) {
      teamStats.set(match.home_team_id, {
        team_id: match.home_team_id, name: homeTeam.name, flag: homeTeam.flag,
        group_name: groupName, played: 0, won: 0, drawn: 0, lost: 0,
        goals_for: 0, goals_against: 0, goal_diff: 0, points: 0,
      });
    }
    if (awayTeam && match.away_team_id && !teamStats.has(match.away_team_id)) {
      teamStats.set(match.away_team_id, {
        team_id: match.away_team_id, name: awayTeam.name, flag: awayTeam.flag,
        group_name: groupName, played: 0, won: 0, drawn: 0, lost: 0,
        goals_for: 0, goals_against: 0, goal_diff: 0, points: 0,
      });
    }
  }

  // Apply match results to team stats
  const applyResult = (homeId: number, awayId: number, homeGoals: number, awayGoals: number) => {
    const home = teamStats.get(homeId);
    const away = teamStats.get(awayId);
    if (!home || !away) return;

    home.played++; home.goals_for += homeGoals; home.goals_against += awayGoals;
    away.played++; away.goals_for += awayGoals; away.goals_against += homeGoals;

    if (homeGoals > awayGoals) {
      home.won++; home.points += 3; away.lost++;
    } else if (homeGoals < awayGoals) {
      away.won++; away.points += 3; home.lost++;
    } else {
      home.drawn++; home.points++; away.drawn++; away.points++;
    }

    home.goal_diff = home.goals_for - home.goals_against;
    away.goal_diff = away.goals_for - away.goals_against;
  };

  for (const match of groupMatches) {
    const pred = predMap.get(match.id);

    if (pred && pred.predicted_home_score !== null && pred.predicted_away_score !== null) {
      // Use user's prediction
      applyResult(match.home_team_id, match.away_team_id, pred.predicted_home_score, pred.predicted_away_score);
    } else if (match.status === 'finished' && match.home_score !== null && match.away_score !== null) {
      // Fall back to real result for finished matches without prediction
      applyResult(match.home_team_id, match.away_team_id, match.home_score, match.away_score);
    }
    // Pending + no prediction → skip (team stays at 0)
  }

  // Group teams by group_name and sort
  const groupsMap = new Map<string, SimulatedTeam[]>();
  for (const team of teamStats.values()) {
    if (!groupsMap.has(team.group_name)) groupsMap.set(team.group_name, []);
    groupsMap.get(team.group_name)!.push(team);
  }

  const groups: SimulatedGroup[] = Array.from(groupsMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group_name, teams]) => ({
      group_name,
      teams: [...teams].sort(compareTeams),
    }));

  // Build qualifier map: "1A" -> first place of Grupo A, etc.
  const qualifierMap = new Map<string, QualifierEntry>();

  for (const group of groups) {
    const letter = group.group_name.replace('Grupo ', '');
    const [first, second, third] = group.teams;
    if (first) qualifierMap.set(`1${letter}`, { name: first.name, flag: first.flag, isSimulated: true });
    if (second) qualifierMap.set(`2${letter}`, { name: second.name, flag: second.flag, isSimulated: true });
    if (third) qualifierMap.set(`3${letter}`, { name: third.name, flag: third.flag, isSimulated: true });
  }

  // Compute best 8 thirds
  const allThirds: SimulatedTeam[] = groups
    .filter(g => g.teams.length >= 3)
    .map(g => g.teams[2]);
  const thirdsRanked = [...allThirds].sort(compareTeams);
  const top8Thirds = thirdsRanked.slice(0, 8);

  // Assign thirds to bracket slots
  // For each slot like "3ABCDF", find the qualifying third whose group letter is in that set
  for (const [slotCode, groupLetters] of Object.entries(THIRD_PLACE_SLOTS)) {
    // Find qualifying thirds from groups in this slot's set
    const candidates = top8Thirds.filter(t => {
      const letter = t.group_name.replace('Grupo ', '');
      return groupLetters.includes(letter);
    });
    // Pick the best-ranked one (already sorted)
    if (candidates.length > 0) {
      const best = candidates[0];
      qualifierMap.set(slotCode, { name: best.name, flag: best.flag, isSimulated: true });
    }
  }

  return { groups, qualifierMap, thirdsRanked };
}
