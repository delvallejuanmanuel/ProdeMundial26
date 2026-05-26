import React from 'react';
import { Header } from '@/components/layout/Header';
import { PotWidget } from '@/components/dashboard/PotWidget';
import { MatchCard } from '@/components/dashboard/MatchCard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LandingHero } from '@/components/layout/LandingHero';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header isLoggedIn={false} />
        <LandingHero />
      </div>
    );
  }

  // Calculate next 48 hours
  const now = new Date();
  const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Fetch actual matches from DB for next 48 hours
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      id,
      kickoff_time,
      status,
      phase,
      home_score,
      away_score,
      home_team:teams!home_team_id (name, flag),
      away_team:teams!away_team_id (name, flag)
    `)
    .gte('kickoff_time', now.toISOString())
    .lte('kickoff_time', next48h.toISOString())
    .order('kickoff_time', { ascending: true });

  // Fetch user profile to check payment status
  const { data: profile } = await supabase
    .from('profiles')
    .select('paid_groups, paid_knockouts, is_admin, name, nickname')
    .eq('id', user.id)
    .single();

  const hasPaidGroups = profile?.paid_groups ?? false;
  const hasPaidKnockouts = profile?.paid_knockouts ?? false;
  const isAdmin = profile?.is_admin ?? false;

  // Fetch user predictions
  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home_score, predicted_away_score, awarded_points')
    .eq('user_id', user.id);
    
  const predictions = userPredictions || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">
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

        {/* Welcome Section */}
        <section className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">
            Hola, {profile?.nickname || profile?.name || user.user_metadata?.full_name || 'Participante'} 👋
          </h1>
          <p className="text-muted-foreground">Aquí está el estado actual del torneo. ¡No olvides cargar tus pronósticos!</p>
        </section>

        {/* Pot Widget Section */}
        <section>
          <PotWidget />
        </section>

        {/* Fixture / Matches Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Próximos 48hs</h2>
            <Link href="/fixture" className="text-sm text-primary hover:underline font-medium">Ver Fixture Completo</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches && matches.length > 0 ? (
              matches.map((match: any) => {
                const date = new Date(match.kickoff_time);
                const userPrediction = predictions.find(p => p.match_id === match.id);
                const isGroupStage = match.phase.startsWith('Grupo');
                const canPlayMatch = isGroupStage ? hasPaidGroups : hasPaidKnockouts;
                
                return (
                  <MatchCard 
                    key={match.id}
                    matchId={match.id}
                    homeTeam={match.home_team?.name || 'Por definir'} 
                    awayTeam={match.away_team?.name || 'Por definir'} 
                    homeFlag={match.home_team?.flag || '❓'} 
                    awayFlag={match.away_team?.flag || '❓'} 
                    matchDate={date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} 
                    matchTime={date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} 
                    groupName={match.phase.toUpperCase()} 
                    status={match.status} 
                    userId={user.id}
                    hasPaid={canPlayMatch}
                    actualHomeScore={match.home_score}
                    actualAwayScore={match.away_score}
                    awardedPoints={userPrediction?.awarded_points}
                    initialHomeScore={userPrediction?.predicted_home_score}
                    initialAwayScore={userPrediction?.predicted_away_score}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-xl">
                No hay partidos programados para las próximas 48 horas.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
