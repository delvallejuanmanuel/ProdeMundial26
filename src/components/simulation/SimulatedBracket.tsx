import React from 'react';
import { QualifierEntry } from '@/utils/simulation';

interface Props {
  qualifierMap: Map<string, QualifierEntry>;
}

const PLACEHOLDERS: Record<number, { home: string; away: string }> = {
  // 16AVOS DE FINAL
  73: { home: '2A', away: '2B' },
  74: { home: '1E', away: '3ABCDF' },
  75: { home: '1F', away: '2C' },
  76: { home: '1C', away: '2F' },
  77: { home: '1I', away: '3CDFGH' },
  78: { home: '2E', away: '2I' },
  79: { home: '1A', away: '3CEFHI' },
  80: { home: '1L', away: '3EHIJK' },
  81: { home: '1D', away: '3BEFIJ' },
  82: { home: '1G', away: '3AEHIJ' },
  83: { home: '2K', away: '2L' },
  84: { home: '1H', away: '2J' },
  85: { home: '1B', away: '3EFGIJ' },
  86: { home: '1J', away: '2H' },
  87: { home: '1K', away: '3DEIJL' },
  88: { home: '2D', away: '2G' },
  // OCTAVOS
  89: { home: 'W74', away: 'W77' },
  90: { home: 'W73', away: 'W75' },
  91: { home: 'W76', away: 'W78' },
  92: { home: 'W79', away: 'W80' },
  93: { home: 'W83', away: 'W84' },
  94: { home: 'W81', away: 'W82' },
  95: { home: 'W86', away: 'W88' },
  96: { home: 'W85', away: 'W87' },
  // CUARTOS
  97: { home: 'W89', away: 'W90' },
  98: { home: 'W93', away: 'W94' },
  99: { home: 'W91', away: 'W92' },
  100: { home: 'W95', away: 'W96' },
  // SEMIS
  101: { home: 'W97', away: 'W98' },
  102: { home: 'W99', away: 'W100' },
  // TERCER PUESTO + FINAL
  103: { home: 'RU101', away: 'RU102' },
  104: { home: 'W101', away: 'W102' },
};

const IS_R32 = (id: number) => id >= 73 && id <= 88;

function TeamRow({
  code,
  qualifierMap,
}: {
  code: string;
  qualifierMap: Map<string, QualifierEntry>;
}) {
  const qualifier = IS_R32_CODE(code) ? qualifierMap.get(code) : null;

  if (qualifier) {
    return (
      <div className="flex items-center gap-1.5 overflow-hidden px-2 py-1.5">
        <img
          src={qualifier.flag}
          alt={qualifier.name}
          width={14}
          height={14}
          className="rounded-sm object-cover shrink-0"
        />
        <span className="truncate text-[11px] font-bold text-primary">{qualifier.name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 overflow-hidden px-2 py-1.5">
      <div className="w-3.5 h-3.5 rounded-sm bg-muted/60 shrink-0" />
      <span className="text-[10px] font-medium text-muted-foreground/60 truncate">{code}</span>
    </div>
  );
}

// A code is "resolvable" (1A, 2B, 3ABCDF...) only for R32 matches
function IS_R32_CODE(code: string): boolean {
  return /^[123][A-L]/.test(code) || /^3[A-L]{2,}/.test(code);
}

function MatchNode({
  matchId,
  qualifierMap,
}: {
  matchId?: number;
  qualifierMap: Map<string, QualifierEntry>;
}) {
  if (!matchId) return <div className="w-[180px] h-[70px] opacity-0 shrink-0" />;

  const ph = PLACEHOLDERS[matchId] || { home: 'TBD', away: 'TBD' };
  const is32 = IS_R32(matchId);

  return (
    <div
      className={`w-[180px] bg-card border rounded-lg shadow-sm flex flex-col text-xs overflow-hidden shrink-0 transition-transform hover:scale-105 ${
        is32 ? 'border-primary/20' : 'border-border/50'
      }`}
    >
      <div className="bg-muted/40 px-2 py-1 border-b border-border/40 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground font-medium">M{matchId}</span>
        {is32 && (
          <span className="text-[8px] font-bold text-primary/60 uppercase tracking-wide">simulado</span>
        )}
      </div>
      <div className="flex flex-col divide-y divide-border/20">
        <TeamRow code={ph.home} qualifierMap={qualifierMap} />
        <TeamRow code={ph.away} qualifierMap={qualifierMap} />
      </div>
    </div>
  );
}

export function SimulatedBracket({ qualifierMap }: Props) {
  const left16  = [73, 75, 74, 77, 76, 78, 79, 80];
  const right16 = [81, 82, 83, 84, 85, 87, 86, 88];
  const left8   = [90, 89, 91, 92];
  const right8  = [94, 93, 96, 95];
  const left4   = [97, 99];
  const right4  = [98, 100];
  const left2   = [101];
  const right2  = [102];

  return (
    <div className="w-full bg-card border border-border/50 rounded-2xl shadow-sm p-4 md:p-6 overflow-hidden flex flex-col">
      <div className="overflow-x-auto pb-6 sim-scrollbar px-4">
        <div className="min-w-[1900px] flex justify-between items-center gap-4">

          {/* LEFT SIDE */}
          <div className="flex gap-4 items-center">
            <div className="flex flex-col gap-2">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">16avos</h3>
              {left16.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
            <div className="flex flex-col gap-6 justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Octavos</h3>
              {left8.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
            <div className="flex flex-col gap-[72px] justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Cuartos</h3>
              {left4.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
            <div className="flex flex-col justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Semifinal</h3>
              {left2.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
          </div>

          {/* CENTER — FINAL & 3RD */}
          <div className="flex flex-col gap-12 items-center justify-center px-4">
            <div className="flex flex-col items-center">
              <h3 className="text-center font-bold text-base text-primary uppercase mb-3">La Gran Final</h3>
              <MatchNode matchId={104} qualifierMap={qualifierMap} />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2 mt-4">Tercer Puesto</h3>
              <MatchNode matchId={103} qualifierMap={qualifierMap} />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex gap-4 items-center flex-row-reverse">
            <div className="flex flex-col gap-2">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">16avos</h3>
              {right16.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
            <div className="flex flex-col gap-6 justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Octavos</h3>
              {right8.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
            <div className="flex flex-col gap-[72px] justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Cuartos</h3>
              {right4.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
            <div className="flex flex-col justify-around h-full">
              <h3 className="text-center font-bold text-xs text-muted-foreground uppercase mb-2">Semifinal</h3>
              {right2.map(id => <MatchNode key={id} matchId={id} qualifierMap={qualifierMap} />)}
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .sim-scrollbar::-webkit-scrollbar { height: 8px; }
        .sim-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
        .sim-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .sim-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}
