import React from 'react';
import { Header } from '@/components/layout/Header';
import { Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SpecialPredictionsForm } from '@/components/dashboard/SpecialPredictionsForm';

export const dynamic = 'force-dynamic';

export default async function SpecialPredictionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch teams
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, flag')
    .order('name', { ascending: true });

  // Fetch players
  const { data: players } = await supabase
    .from('players')
    .select('id, name, team_id')
    .order('name', { ascending: true });

  // Fetch user profile for payment status
  const { data: profile } = await supabase
    .from('profiles')
    .select('paid_groups, paid_knockouts, is_admin')
    .eq('id', user.id)
    .single();

  const hasPaid = profile?.paid_groups || profile?.paid_knockouts || false;
  const isAdmin = profile?.is_admin || false;

  // Fetch user's special predictions
  const { data: specialPrediction } = await supabase
    .from('special_predictions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fecha límite de especiales: Viernes 12 de Junio 2026 a las 23:59:59 ART (que equivale a 2026-06-13T02:59:59Z UTC)
  const specialsDeadline = new Date('2026-06-13T02:59:59Z');
  const isLocked = new Date() > specialsDeadline;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl space-y-8">
        
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <Star className="w-8 h-8 text-primary" /> Pronósticos Especiales
          </h1>
          <p className="text-muted-foreground">Suma puntos extra al finalizar el Mundial prediciendo estos 3 hitos clave. ¡Elegí con sabiduría!</p>
        </div>

        <SpecialPredictionsForm 
          teams={teams || []} 
          players={players || []} 
          initialPrediction={specialPrediction} 
          userId={user.id}
          hasPaid={hasPaid}
          isLocked={isLocked}
        />

      </main>
    </div>
  );
}
