import React from 'react';
import { Header } from '@/components/layout/Header';
import { StandingsBoard } from '@/components/StandingsBoard';
import { TopScorersTable } from '@/components/TopScorersTable';
import { KnockoutBracket } from '@/components/KnockoutBracket';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user profile to check payment status/admin
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} isLoggedIn={!!user} />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">
        <section className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Estadísticas y Tablas</h1>
          <p className="text-muted-foreground">Posiciones en la fase de grupos y tabla de goleadores del torneo.</p>
        </section>

        <section className="space-y-6 pt-6 border-t border-border/50">
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1">
              <StandingsBoard />
            </div>
            <div className="w-full xl:w-[350px]">
              <TopScorersTable />
            </div>
          </div>
        </section>

        <section className="pt-6 border-t border-border/50">
          <KnockoutBracket />
        </section>
      </main>
    </div>
  );
}
