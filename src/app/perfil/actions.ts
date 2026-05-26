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

  const { error, count } = await supabase
    .from('profiles')
    .update({ nickname })
    .eq('id', user.id)
    .select('id', { count: 'exact' });

  if (error) {
    throw new Error('Error al actualizar el apodo');
  }

  if (count === 0 || count === null) {
    throw new Error('No se pudo actualizar el apodo. Violación de permisos o perfil no encontrado.');
  }

  revalidatePath('/perfil');
  revalidatePath('/leaderboard');
  revalidatePath('/');
}
