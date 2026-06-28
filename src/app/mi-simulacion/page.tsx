import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { SimulatedBracket } from '@/components/simulation/SimulatedBracket';
import { computePlayoffSimulation } from '@/utils/simulation';
import Link from 'next/link';
import { ArrowLeft, FlaskConical, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MiSimulacionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, name, nickname')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;

  // Fetch all playoff matches (exclude group stage)
  const { data: playoffMatches } = await supabase
    .from('matches')
    .select(`
      id,
      phase,
      status,
      home_score,
      away_score,
      home_team_id,
      away_team_id,
      winner_by_penalties_team_id,
      home_team:teams!home_team_id(id, name, flag),
      away_team:teams!away_team_id(id, name, flag)
    `)
    .not('phase', 'like', 'Grupo%')
    .order('kickoff_time', { ascending: true });

  // Fetch user's predictions for playoff matches
  const playoffMatchIds = (playoffMatches ?? []).map(m => m.id);
  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home_score, predicted_away_score, predicted_penalties_winner_team_id')
    .eq('user_id', user.id)
    .in('match_id', playoffMatchIds.length > 0 ? playoffMatchIds : [-1]);

  const { qualifierMap } = computePlayoffSimulation(
    playoffMatches ?? [],
    userPredictions ?? []
  );

  const totalPlayoffMatches = playoffMatchIds.length;
  const predictedMatchCount = (userPredictions ?? []).filter(
    p => p.predicted_home_score !== null && p.predicted_away_score !== null
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} />

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            href="/estadisticas"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Estadísticas
          </Link>
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Mi Simulación (Playoffs)</h1>
              <p className="text-muted-foreground mt-1">
                Así avanzaría tu cuadro de playoffs <strong>si todos tus pronósticos del Fixture se cumplen</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage indicator */}
        <div className={`rounded-xl p-4 flex items-start gap-3 border ${
          predictedMatchCount === totalPlayoffMatches
            ? 'bg-primary/5 border-primary/20 text-primary'
            : predictedMatchCount === 0
            ? 'bg-destructive/10 border-destructive/20 text-destructive'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {predictedMatchCount < totalPlayoffMatches && (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm">
              {predictedMatchCount === 0
                ? 'No cargaste ningún pronóstico de eliminatorias todavía.'
                : predictedMatchCount === totalPlayoffMatches
                ? `Pronósticos completos — los ${totalPlayoffMatches} partidos de fase eliminatoria están simulados.`
                : `Simulación parcial: ${predictedMatchCount} de ${totalPlayoffMatches} partidos pronosticados.`
              }
            </p>
            {predictedMatchCount < totalPlayoffMatches && predictedMatchCount > 0 && (
              <p className="text-xs mt-1 opacity-80">
                Los partidos sin pronóstico usan el resultado real si está disponible, o no se contabilizan para la siguiente llave.
              </p>
            )}
            {predictedMatchCount === 0 && (
              <Link href="/fixture" className="text-xs underline mt-1 inline-block opacity-80 hover:opacity-100">
                Ir al fixture para cargar tus pronósticos →
              </Link>
            )}
          </div>
        </div>

        {/* Simulated Bracket */}
        <section className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h2 className="text-xl font-black tracking-tight">Cuadro de Playoffs Simulado</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Los equipos en{' '}
              <span className="text-primary font-bold">verde</span> son los que avanzarían gracias a tu predicción (o a que acertaste al ganador real).
            </p>
          </div>
          <SimulatedBracket qualifierMap={qualifierMap} />
        </section>
      </main>
    </div>
  );
}
