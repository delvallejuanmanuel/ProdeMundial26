'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateNickname(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  const nickname = formData.get('nickname') as string;

  const { error } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id);

  if (error) {
    throw new Error('Error al actualizar el apodo');
  }

  revalidatePath('/perfil');
  revalidatePath('/leaderboard');
  revalidatePath('/');
}
