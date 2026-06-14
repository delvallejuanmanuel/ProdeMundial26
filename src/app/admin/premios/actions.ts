'use server';

import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/mailer';
import { revalidatePath } from 'next/cache';

export async function markAsWinner(matchday: number, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'No eres administrador' };

  // Check if winner already exists for this matchday
  const { data: existing } = await supabase.from('matchday_winners').select('id').eq('matchday', matchday);
  if (existing && existing.length > 0) {
    return { error: 'Ya existe un ganador para esta fecha' };
  }

  const { error: insertError } = await supabase.from('matchday_winners').insert({
    matchday,
    user_id: userId,
    status: 'pending_payment'
  });

  if (insertError) return { error: insertError.message };

  revalidatePath('/admin/premios');
  revalidatePath('/leaderboard');
  return { success: true };
}

export async function sendPrizeEmail(matchday: number, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'No eres administrador' };

  const { data: winnerProfile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (!winnerProfile || !winnerProfile.email) return { error: 'El usuario no tiene email configurado' };

  try {
    await sendEmail({
      to: winnerProfile.email,
      subject: `¡Ganaste la Fecha ${matchday} del Prode Mundial! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">¡Felicitaciones ${winnerProfile.nickname || winnerProfile.name}! 🏆</h1>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; line-height: 1.5; color: #333333;">Te escribimos para avisarte que tu increíble desempeño te consagró como <strong>GANADOR de la Fecha ${matchday}</strong> del Prode Mundial.</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333333;">Para hacerte llegar tu premio, por favor responde a este correo indicando tu <strong>Alias o CBU</strong> y a nombre de quién está la cuenta bancaria.</p>
            <p style="font-size: 16px; line-height: 1.5; color: #333333;">¡Muchas gracias por participar y mucha suerte en la próxima fecha!</p>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #64748b; margin: 0;">Administración del Prode Mundial 2026</p>
          </div>
        </div>
      `
    });

    await supabase.from('matchday_winners').update({ status: 'notified' }).eq('matchday', matchday).eq('user_id', userId);

    revalidatePath('/admin/premios');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function markAsPaid(matchday: number, userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autorizado' };

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: 'No eres administrador' };

  const { error: updateError } = await supabase.from('matchday_winners').update({ status: 'paid' }).eq('matchday', matchday).eq('user_id', userId);

  if (updateError) return { error: updateError.message };

  revalidatePath('/admin/premios');
  return { success: true };
}
