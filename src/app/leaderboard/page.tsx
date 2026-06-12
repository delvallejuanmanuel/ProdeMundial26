import React from 'react';
import { Header } from '@/components/layout/Header';
import { createClient } from '@/utils/supabase/server';
import { Trophy, Medal, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const supabase = await createClient();
  
  const { data: leaderboard, error } = await supabase
    .from('v_leaderboard')
    .select('*')
    .order('total_score', { ascending: false });

  // For MVP, if no real users are found, we'll mock a few to show the UI
  const users = leaderboard && leaderboard.length > 0 ? leaderboard : [
    { user_id: '1', name: 'Leo Messi', nickname: 'La Pulga', total_score: 120, exact_matches: 15, special_points: 30, paid_groups: true, paid_knockouts: true },
    { user_id: '2', name: 'Matias', nickname: null, total_score: 95, exact_matches: 8, special_points: 15, paid_groups: true, paid_knockouts: false },
    { user_id: '3', name: 'Sofia', nickname: 'Sofi', total_score: 80, exact_matches: 6, special_points: 0, paid_groups: true, paid_knockouts: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
        
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Trophy className="w-8 h-8 text-primary" /> Tabla de Posiciones
          </h1>
          <p className="text-muted-foreground">Ranking general del Prode Mundial 2026. Los premios se asignan según esta tabla.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-background/50 border-b border-border/50 text-muted-foreground whitespace-nowrap">
                <tr>
                  <th className="px-4 py-4 font-bold w-12">Pos</th>
                  <th className="px-4 py-4 font-bold min-w-[150px]">Jugador</th>
                  <th className="px-3 py-4 font-bold text-center" title="Partidos Jugados">PJ</th>
                  <th className="px-3 py-4 font-bold text-center text-green-500" title="Resultado Exacto (5 pts)">Plenos</th>
                  <th className="px-3 py-4 font-bold text-center text-blue-500" title="Diferencia de Goles (3 pts)">Dif. Goles</th>
                  <th className="px-3 py-4 font-bold text-center text-yellow-500" title="Ganador/Empate (1 pt)">Resultado</th>
                  <th className="px-3 py-4 font-bold text-center text-red-500" title="Sin Puntos (0 pts)">Errados</th>
                  <th className="px-3 py-4 font-bold text-center text-purple-500" title="Puntos por pronósticos especiales">Especiales</th>
                  <th className="px-4 py-4 font-bold text-right text-primary">Puntos</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const isFirst = index === 0;
                  const isSecond = index === 1;
                  const isThird = index === 2;
                  const paidCount = (user.paid_groups ? 1 : 0) + (user.paid_knockouts ? 1 : 0);
                  const isIneligible = paidCount < 2;

                  return (
                    <tr key={user.user_id} className={`border-b border-border/20 hover:bg-white/5 transition-colors ${isFirst ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-bold">
                        {isFirst ? <Medal className="w-5 h-5 text-yellow-500" /> : 
                         isSecond ? <Medal className="w-5 h-5 text-gray-400" /> : 
                         isThird ? <Medal className="w-5 h-5 text-amber-700" /> : 
                         <span className="pl-1">{index + 1}</span>}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/jugador/${user.user_id}`} className="block hover:text-primary transition-colors" title={`Ver perfil de ${user.nickname || user.name}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="truncate max-w-[120px] sm:max-w-xs block leading-tight hover:underline">{user.nickname || user.name}</span>
                            {isIneligible && (
                              <Badge variant={paidCount === 0 ? "destructive" : "secondary"} className="text-[9px] h-4 px-1.5 flex items-center gap-1 w-max">
                                <AlertCircle className="w-2.5 h-2.5" /> Cuota {paidCount}/2
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-center font-medium">
                        {user.matches_played ?? 0}
                        {(user.live_matches ?? 0) > 0 && <span className="text-red-500 font-bold ml-0.5" title="Partido en vivo">*</span>}
                      </td>
                      <td className="px-3 py-3 text-center font-medium text-green-400">{user.exact_matches ?? 0}</td>
                      <td className="px-3 py-3 text-center font-medium text-blue-400">{user.diff_matches ?? 0}</td>
                      <td className="px-3 py-3 text-center font-medium text-yellow-400">{user.result_matches ?? 0}</td>
                      <td className="px-3 py-3 text-center font-medium text-red-400">{user.missed_matches ?? 0}</td>
                      <td className="px-3 py-3 text-center font-medium text-purple-400">{user.special_points ?? 0}</td>
                      <td className={`px-4 py-3 text-right font-black text-lg ${isFirst ? 'text-primary' : 'text-foreground'}`}>
                        {user.total_score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {users.some(u => (u.live_matches ?? 0) > 0) && (
            <div className="bg-muted/10 px-4 py-3 text-xs text-muted-foreground border-t border-border flex items-center gap-1">
              <span className="text-red-500 font-bold">*</span> Partido en vivo (puntaje parcial)
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
