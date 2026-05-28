"use server";

import { createClient } from '@supabase/supabase-js';

// Usamos el Service Role Key para saltarnos el RLS y actuar como administrador
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE!; // Fallback

// Inicializamos el cliente de supabase con permisos de admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

export async function updatePlayerGoalsAction(playerId: number, goals: number) {
  if (!supabaseServiceKey) {
    throw new Error("No hay Service Role Key configurada en las variables de entorno.");
  }
  
  const { error } = await supabaseAdmin
    .from('players')
    .update({ goals })
    .eq('id', playerId);
    
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateMatchAction(matchId: number, status: string, homeScore: number | null, awayScore: number | null) {
  if (!supabaseServiceKey) {
    throw new Error("No hay Service Role Key configurada en las variables de entorno.");
  }

  const { error } = await supabaseAdmin
    .from('matches')
    .update({
      status,
      home_score: homeScore,
      away_score: awayScore
    })
    .eq('id', matchId);

  if (error) throw new Error(error.message);
  return { success: true };
}
