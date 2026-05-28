import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';

interface Match {
  id: number;
  phase: string;
  kickoff_time: string;
  home_team_id: number | null;
  away_team_id: number | null;
  home_score: number | null;
  away_score: number | null;
  winner_by_penalties_team_id: number | null;
  status: string;
  home_name: string | null;
  home_flag: string | null;
  away_name: string | null;
  away_flag: string | null;
}

const PLACEHOLDERS: Record<number, { home: string, away: string }> = {
  // 16AVOS DE FINAL
  73: { home: '2º Grupo A', away: '2º Grupo B' },
  74: { home: '1º Grupo E', away: '3º Gr A/B/C/D/F' },
  75: { home: '1º Grupo F', away: '2º Grupo C' },
  76: { home: '1º Grupo C', away: '2º Grupo F' },
  77: { home: '1º Grupo I', away: '3º Gr C/D/F/G/H' },
  78: { home: '2º Grupo E', away: '2º Grupo I' },
  79: { home: '1º Grupo A', away: '3º Gr C/E/F/H/I' },
  80: { home: '1º Grupo L', away: '3º Gr E/H/I/J/K' },
  81: { home: '1º Grupo D', away: '3º Gr B/E/F/I/J' },
  82: { home: '1º Grupo G', away: '3º Gr A/E/H/I/J' },
  83: { home: '2º Grupo K', away: '2º Grupo L' },
  84: { home: '1º Grupo H', away: '2º Grupo J' },
  85: { home: '1º Grupo B', away: '3º Gr E/F/G/I/J' },
  86: { home: '1º Grupo J', away: '2º Grupo H' },
  87: { home: '1º Grupo K', away: '3º Gr D/E/I/J/L' },
  88: { home: '2º Grupo D', away: '2º Grupo G' },
  // OCTAVOS DE FINAL
  89: { home: 'Ganador 74', away: 'Ganador 77' },
  90: { home: 'Ganador 73', away: 'Ganador 75' },
  91: { home: 'Ganador 76', away: 'Ganador 78' },
  92: { home: 'Ganador 79', away: 'Ganador 80' },
  93: { home: 'Ganador 83', away: 'Ganador 84' },
  94: { home: 'Ganador 81', away: 'Ganador 82' },
  95: { home: 'Ganador 86', away: 'Ganador 88' },
  96: { home: 'Ganador 85', away: 'Ganador 87' },
  // CUARTOS DE FINAL
  97: { home: 'Ganador 89', away: 'Ganador 90' },
  98: { home: 'Ganador 93', away: 'Ganador 94' },
  99: { home: 'Ganador 91', away: 'Ganador 92' },
  100: { home: 'Ganador 95', away: 'Ganador 96' },
  // SEMIFINALES
  101: { home: 'Ganador 97', away: 'Ganador 98' },
  102: { home: 'Ganador 99', away: 'Ganador 100' },
  // TERCER PUESTO
  103: { home: 'Perdedor 101', away: 'Perdedor 102' },
  // FINAL
  104: { home: 'Ganador 101', away: 'Ganador 102' },
};

function MatchNode({ match, side }: { match?: Match, side?: 'left' | 'right' }) {
  if (!match) return <div className="w-[180px] h-[80px] opacity-0 shrink-0" />;

  const placeholder = PLACEHOLDERS[match.id] || { home: 'TBD', away: 'TBD' };
  
  const homeDisplay = match.home_name || placeholder.home;
  const awayDisplay = match.away_name || placeholder.away;
  
  // Convert UTC to ART visually (assuming kickoff_time is stored such that displaying it as UTC equals local time)
  const d = new Date(match.kickoff_time);
  const dateStr = d.toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' });
  const timeStr = d.toLocaleTimeString('es-AR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-[180px] bg-card border border-border/50 rounded-lg shadow-sm flex flex-col text-xs overflow-hidden shrink-0 transition-transform hover:scale-105">
      <div className="bg-muted/50 px-2 py-1 flex justify-between items-center border-b border-border/50">
        <span className="text-[10px] text-muted-foreground font-medium">M{match.id} - {dateStr} {timeStr}</span>
      </div>
      
      <div className="flex flex-col">
        {/* Home */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/10">
          <div className="flex items-center gap-2 overflow-hidden">
            {match.home_flag ? (
              <Image src={match.home_flag} alt={homeDisplay} width={16} height={16} className="rounded-sm object-cover" />
            ) : (
              <div className="w-4 h-4 bg-muted rounded-sm" />
            )}
            <span className="truncate font-medium text-foreground">{homeDisplay}</span>
          </div>
          {match.home_score !== null && (
            <span className="font-bold tabular-nums ml-2">{match.home_score}</span>
          )}
        </div>
        
        {/* Away */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2 overflow-hidden">
            {match.away_flag ? (
              <Image src={match.away_flag} alt={awayDisplay} width={16} height={16} className="rounded-sm object-cover" />
            ) : (
              <div className="w-4 h-4 bg-muted rounded-sm" />
            )}
            <span className="truncate font-medium text-foreground">{awayDisplay}</span>
          </div>
          {match.away_score !== null && (
            <span className="font-bold tabular-nums ml-2">{match.away_score}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export async function KnockoutBracket() {
  const supabase = await createClient();

  const { data: matchesData, error } = await supabase
    .from('matches')
    .select(`
      id, phase, kickoff_time, status, home_score, away_score, winner_by_penalties_team_id,
      home_team_id, away_team_id,
      t1:home_team_id(name, flag),
      t2:away_team_id(name, flag)
    `)
    .gte('id', 73)
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching knockout matches", error);
    return null;
  }

  // Format matches array
  const matches: Match[] = (matchesData || []).map(m => ({
    id: m.id,
    phase: m.phase,
    kickoff_time: m.kickoff_time,
    status: m.status,
    home_score: m.home_score,
    away_score: m.away_score,
    winner_by_penalties_team_id: m.winner_by_penalties_team_id,
    home_team_id: m.home_team_id,
    away_team_id: m.away_team_id,
    home_name: m.t1?.name || null,
    home_flag: m.t1?.flag || null,
    away_name: m.t2?.name || null,
    away_flag: m.t2?.flag || null,
  }));

  const getMatch = (id: number) => matches.find(m => m.id === id);

  // Grouped matches for a symmetrical layout:
  // Left Side: 16avos (Top 8), Octavos (Top 4), Cuartos (Top 2), Semis (Top 1)
  // Right Side: 16avos (Bottom 8), Octavos (Bottom 4), Cuartos (Bottom 2), Semis (Bottom 1)
  
  // From the official 2026 bracket flow, it's roughly structured into halves.
  // Left side matches (usually IDs 73-80) and Right side (81-88) - this is an approximation for visual balance.
  const left16 = [73, 75, 74, 77, 76, 78, 79, 80];
  const right16 = [81, 82, 83, 84, 85, 87, 86, 88];

  const left8 = [90, 89, 91, 92]; // Winners of left16
  const right8 = [94, 93, 96, 95]; // Winners of right16

  const left4 = [97, 99]; // Cuartos
  const right4 = [98, 100]; // Cuartos

  const left2 = [101]; // Semi 1
  const right2 = [102]; // Semi 2
  
  const final = getMatch(104);
  const third = getMatch(103);

  return (
    <div className="w-full bg-card border border-border/50 rounded-2xl shadow-sm p-4 md:p-6 overflow-hidden flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight">Fase Final - Cuadro de Cruces</h2>
        <p className="text-sm text-muted-foreground">A medida que avance el mundial, los equipos irán completando las llaves automáticamente.</p>
      </div>

      <div className="overflow-x-auto pb-6 custom-scrollbar">
        <div className="min-w-[1200px] flex justify-between items-center gap-4">
          
          {/* LEFT SIDE */}
          <div className="flex gap-4 items-center">
            {/* 16avos Left */}
            <div className="flex flex-col gap-2">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">16avos</h3>
              {left16.map(id => <MatchNode key={id} match={getMatch(id)} side="left" />)}
            </div>
            
            {/* Octavos Left */}
            <div className="flex flex-col gap-6 justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Octavos</h3>
              {left8.map(id => <MatchNode key={id} match={getMatch(id)} side="left" />)}
            </div>

            {/* Cuartos Left */}
            <div className="flex flex-col gap-[72px] justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Cuartos</h3>
              {left4.map(id => <MatchNode key={id} match={getMatch(id)} side="left" />)}
            </div>

            {/* Semi Left */}
            <div className="flex flex-col justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Semifinal</h3>
              {left2.map(id => <MatchNode key={id} match={getMatch(id)} side="left" />)}
            </div>
          </div>

          {/* CENTER - FINAL & 3RD PLACE */}
          <div className="flex flex-col gap-12 items-center justify-center px-4">
            <div className="flex flex-col items-center">
              <h3 className="text-center font-bold text-base text-primary uppercase mb-3">La Gran Final</h3>
              {final ? <MatchNode match={final} /> : <div className="w-[180px] h-[80px]" />}
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2 mt-4">Tercer Puesto</h3>
              {third ? <MatchNode match={third} /> : <div className="w-[180px] h-[80px]" />}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex gap-4 items-center flex-row-reverse">
            {/* 16avos Right */}
            <div className="flex flex-col gap-2">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">16avos</h3>
              {right16.map(id => <MatchNode key={id} match={getMatch(id)} side="right" />)}
            </div>
            
            {/* Octavos Right */}
            <div className="flex flex-col gap-6 justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Octavos</h3>
              {right8.map(id => <MatchNode key={id} match={getMatch(id)} side="right" />)}
            </div>

            {/* Cuartos Right */}
            <div className="flex flex-col gap-[72px] justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Cuartos</h3>
              {right4.map(id => <MatchNode key={id} match={getMatch(id)} side="right" />)}
            </div>

            {/* Semi Right */}
            <div className="flex flex-col justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Semifinal</h3>
              {right2.map(id => <MatchNode key={id} match={getMatch(id)} side="right" />)}
            </div>
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
