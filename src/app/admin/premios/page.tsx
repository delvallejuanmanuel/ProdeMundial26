import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Trophy, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { markAsWinner, sendPrizeEmail, markAsPaid } from './actions';
import { AdminPrizeActions } from './AdminPrizeActions';

export const dynamic = 'force-dynamic';

export default async function AdminPremiosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || !profile.is_admin) redirect('/');

  // Fetch winners
  const { data: winnersData } = await supabase
    .from('matchday_winners')
    .select('*, profiles(name, nickname, email)');
  const winners = winnersData || [];

  // Fetch top 3 for each matchday
  const { data: md1 } = await supabase.rpc('get_leaderboard_by_matchday', { p_matchday: 1 });
  const { data: md2 } = await supabase.rpc('get_leaderboard_by_matchday', { p_matchday: 2 });
  const { data: md3 } = await supabase.rpc('get_leaderboard_by_matchday', { p_matchday: 3 });

  const matchdays = [
    { number: 1, leaderboard: md1 || [] },
    { number: 2, leaderboard: md2 || [] },
    { number: 3, leaderboard: md3 || [] }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
          <Trophy className="w-8 h-8 text-primary" /> Panel de Premios
        </h1>
        <p className="text-muted-foreground">Gestiona los ganadores de cada fecha y envía los correos de cobro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {matchdays.map(md => {
          const winner = winners.find(w => w.matchday === md.number);
          const topUsers = md.leaderboard.slice(0, 3);

          return (
            <div key={md.number} className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Fecha {md.number}
                {winner && <Trophy className="w-5 h-5 text-yellow-500" />}
              </h2>

              {winner ? (
                <div className="space-y-4">
                  <div className="bg-secondary/50 p-4 rounded-xl border border-secondary">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Ganador Declarado</div>
                    <div className="text-lg font-black text-primary">{winner.profiles.nickname || winner.profiles.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{winner.profiles.email}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <AdminPrizeActions 
                      matchday={md.number}
                      userId={winner.user_id}
                      status={winner.status}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Top 3 Actual</div>
                  {topUsers.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">No hay puntajes aún.</div>
                  ) : (
                    topUsers.map((u: any, idx: number) => (
                      <div key={u.user_id} className="flex items-center justify-between bg-background p-3 rounded-lg border border-border/50">
                        <div>
                          <div className="font-bold text-sm">
                            {idx + 1}. {u.nickname || u.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {u.total_score} pts | {u.exact_matches} plenos
                          </div>
                        </div>
                        <AdminPrizeActions 
                          matchday={md.number}
                          userId={u.user_id}
                          status="none"
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
