import React from 'react';
import { Header } from '@/components/layout/Header';
import { FixtureList } from '@/components/dashboard/FixtureList';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch player profile
  const { data: playerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, nickname')
    .eq('id', id)
    .single();

  if (profileError || !playerProfile) {
    redirect('/leaderboard');
  }

  // Fetch player leaderboard stats
  const { data: playerStats } = await supabase
    .from('v_leaderboard')
    .select('*')
    .eq('user_id', id)
    .single();

  // Fetch ALL matches
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      kickoff_time,
      status,
      phase,
      home_score,
      away_score,
      home_team_id,
      away_team_id,
      winner_by_penalties_team_id,
      home_team:teams!home_team_id (name, flag),
      away_team:teams!away_team_id (name, flag)
    `)
    .order('kickoff_time', { ascending: true });

  // Fetch player's predictions (only for matches that are not pending, because of anti-fraud rules!)
  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home_score, predicted_away_score, predicted_penalties_winner_team_id, awarded_points, matches!inner(status)')
    .eq('user_id', id)
    .neq('matches.status', 'pending');
    
  const predictions = userPredictions || [];

  // Fetch current user's profile to check if they are admin
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  const isAdmin = myProfile?.is_admin ?? false;
  
  // They are always considered to have paid for viewing purposes, so the MatchCards show the buttons/points
  // Wait, if it's readOnly, MatchCard doesn't care about hasPaid much except for opacity. 
  // Let's pass true so it shows fully opaque.
  const hasPaidGroups = true;
  const hasPaidKnockouts = true;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="bg-card text-card-foreground border border-border shadow-lg rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-black shadow-md">
              {(playerProfile.nickname || playerProfile.name).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{playerProfile.nickname || playerProfile.name}</h1>
              {playerProfile.nickname && (
                <p className="text-muted-foreground">{playerProfile.name}</p>
              )}
            </div>
          </div>
          
          {playerStats && (
            <div className="flex gap-4">
              <div className="bg-muted/50 px-4 py-3 rounded-xl text-center border border-border/50">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Puntos</div>
                <div className="text-3xl font-black text-primary">{playerStats.total_score}</div>
              </div>
              <div className="bg-muted/50 px-4 py-3 rounded-xl text-center border border-border/50">
                <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Plenos</div>
                <div className="text-3xl font-black text-green-500">{playerStats.exact_matches}</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight">Pronósticos de {playerProfile.nickname || playerProfile.name}</h2>
          <p className="text-muted-foreground text-sm">
            Nota: Los pronósticos de partidos futuros (pendientes) se mantienen ocultos por reglas de privacidad del Prode.
          </p>
        </div>

        <FixtureList 
          matches={(matches as any) || []} 
          predictions={predictions} 
          userId={id}
          hasPaidGroups={hasPaidGroups}
          hasPaidKnockouts={hasPaidKnockouts}
          readOnly={true}
        />
      </main>
    </div>
  );
}
