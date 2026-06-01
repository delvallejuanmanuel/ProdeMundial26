import React from 'react';
import { Header } from '@/components/layout/Header';
import { FixtureList } from '@/components/dashboard/FixtureList';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FixturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

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

  // Fetch user profile to check payment status
  const { data: profile } = await supabase
    .from('profiles')
    .select('paid_groups, paid_knockouts, is_admin')
    .eq('id', user.id)
    .single();

  const hasPaidGroups = profile?.paid_groups ?? false;
  const hasPaidKnockouts = profile?.paid_knockouts ?? false;
  const isAdmin = profile?.is_admin ?? false;

  // Fetch user predictions
  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home_score, predicted_away_score, predicted_penalties_winner_team_id, awarded_points')
    .eq('user_id', user.id);
    
  const predictions = userPredictions || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {(!hasPaidGroups || !hasPaidKnockouts) && (
          <div className="bg-destructive/15 text-destructive border border-destructive/30 p-4 rounded-xl flex flex-col gap-1">
            <div className="flex items-center gap-2 font-bold">
              ⚠️ Tienes pagos pendientes de validación
            </div>
            <div className="text-sm ml-7">
              {!hasPaidGroups && <div>• <strong>Fase de Grupos:</strong> No puedes cargar pronósticos.</div>}
              {!hasPaidKnockouts && <div>• <strong>Fase Eliminatoria:</strong> No puedes cargar pronósticos de 16avos en adelante.</div>}
            </div>
          </div>
        )}

        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight">Fixture Completo</h1>
          <p className="text-muted-foreground">Todos los 104 partidos del Mundial 2026.</p>
        </div>

        <FixtureList 
          matches={(matches as any) || []} 
          predictions={predictions} 
          userId={user.id}
          hasPaidGroups={hasPaidGroups}
          hasPaidKnockouts={hasPaidKnockouts}
        />
      </main>
    </div>
  );
}
