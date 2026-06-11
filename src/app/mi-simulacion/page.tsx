import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { SimulatedGroupTable } from '@/components/simulation/SimulatedGroupTable';
import { SimulatedBracket } from '@/components/simulation/SimulatedBracket';
import { computeSimulation, type SimulatedTeam } from '@/utils/simulation';
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

  // Fetch all group stage matches with team info
  const { data: groupMatches } = await supabase
    .from('matches')
    .select(`
      id,
      phase,
      status,
      home_score,
      away_score,
      home_team_id,
      away_team_id,
      home_team:teams!home_team_id(id, name, flag),
      away_team:teams!away_team_id(id, name, flag)
    `)
    .like('phase', 'Grupo%')
    .order('phase', { ascending: true });

  // Fetch user's predictions for group stage matches
  const groupMatchIds = (groupMatches ?? []).map(m => m.id);
  const { data: userPredictions } = await supabase
    .from('predictions')
    .select('match_id, predicted_home_score, predicted_away_score')
    .eq('user_id', user.id)
    .in('match_id', groupMatchIds.length > 0 ? groupMatchIds : [-1]);

  const { groups, qualifierMap, thirdsRanked } = computeSimulation(
    groupMatches ?? [],
    userPredictions ?? []
  );

  const totalGroupMatches = groupMatchIds.length;
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
              <h1 className="text-3xl font-black tracking-tight">Mi Simulación</h1>
              <p className="text-muted-foreground mt-1">
                Así quedarían los grupos y el cuadro de 16avos <strong>si todos tus pronósticos se cumplen</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Coverage indicator */}
        <div className={`rounded-xl p-4 flex items-start gap-3 border ${
          predictedMatchCount === totalGroupMatches
            ? 'bg-primary/5 border-primary/20 text-primary'
            : predictedMatchCount === 0
            ? 'bg-destructive/10 border-destructive/20 text-destructive'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {predictedMatchCount < totalGroupMatches && (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold text-sm">
              {predictedMatchCount === 0
                ? 'No cargaste ningún pronóstico de grupos todavía.'
                : predictedMatchCount === totalGroupMatches
                ? `Pronósticos completos — los ${totalGroupMatches} partidos de grupos están simulados.`
                : `Simulación parcial: ${predictedMatchCount} de ${totalGroupMatches} partidos pronosticados.`
              }
            </p>
            {predictedMatchCount < totalGroupMatches && predictedMatchCount > 0 && (
              <p className="text-xs mt-1 opacity-80">
                Los partidos sin pronóstico usan el resultado real si está disponible, o no se contabilizan.
              </p>
            )}
            {predictedMatchCount === 0 && (
              <Link href="/fixture" className="text-xs underline mt-1 inline-block opacity-80 hover:opacity-100">
                Ir al fixture para cargar tus pronósticos →
              </Link>
            )}
          </div>
        </div>

        {/* Simulated Group Tables */}
        <section className="space-y-4">
          <h2 className="text-xl font-black tracking-tight">Posiciones Simuladas</h2>
          <p className="text-sm text-muted-foreground -mt-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-primary/20 border border-primary/40 mr-1.5 align-middle" />
            Clasifica directo (1° y 2°) &nbsp;
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/40 mr-1.5 align-middle" />
            Posible mejor 3°
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {groups.map(group => (
              <SimulatedGroupTable
                key={group.group_name}
                group={group}
                qualifyingThirdIds={thirdsRanked.slice(0, 8).map(t => t.team_id)}
              />
            ))}
          </div>
        </section>

        {/* Simulated Bracket */}
        <section className="space-y-4 pt-4 border-t border-border/50">
          <div>
            <h2 className="text-xl font-black tracking-tight">Cuadro de 16avos — Simulado</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Basado en tus pronósticos de fase de grupos. Los equipos en{' '}
              <span className="text-primary font-bold">verde</span> son los que clasificarían según tu simulación.
            </p>
          </div>
          <SimulatedBracket qualifierMap={qualifierMap} />
        </section>
      </main>
    </div>
  );
}
