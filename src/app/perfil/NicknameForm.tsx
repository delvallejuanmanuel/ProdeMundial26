'use client';

import { useState } from 'react';
import { updateNickname } from './actions';
import { Button } from '@/components/ui/button';

export function NicknameForm({ currentNickname }: { currentNickname?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    setSuccess(false);
    try {
      await updateNickname(formData);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('Error al guardar apodo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={action} className="mt-4 mb-6 space-y-3 p-4 bg-background/50 rounded-xl border border-border/30">
      <div>
        <label htmlFor="nickname" className="block text-sm font-bold text-muted-foreground mb-1">Apodo (Mostrado en posiciones)</label>
        <div className="flex gap-2">
          <input 
            id="nickname"
            name="nickname"
            type="text" 
            defaultValue={currentNickname || ''}
            placeholder="Tu apodo"
            maxLength={20}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
      {success && <p className="text-sm font-medium text-green-500">¡Apodo guardado correctamente!</p>}
    </form>
  );
}
