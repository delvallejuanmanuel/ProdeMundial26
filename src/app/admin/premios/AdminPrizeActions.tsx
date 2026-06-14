'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { markAsWinner, sendPrizeEmail, markAsPaid } from './actions';

interface Props {
  matchday: number;
  userId: string;
  status: string; // 'none', 'pending_payment', 'notified', 'paid'
}

export function AdminPrizeActions({ matchday, userId, status }: Props) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionFn: () => Promise<{ error?: string, success?: boolean }>, successMsg: string) => {
    setLoading(true);
    try {
      const res = await actionFn();
      if (res.error) throw new Error(res.error);
      alert(`Éxito: ${successMsg}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'none') {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="text-xs"
        disabled={loading}
        onClick={() => handleAction(() => markAsWinner(matchday, userId), "Ganador seleccionado correctamente")}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Trophy className="w-3 h-3 mr-1" />}
        Elegir
      </Button>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</span>
        {status === 'pending_payment' && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">Pendiente Mail</Badge>}
        {status === 'notified' && <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">Notificado</Badge>}
        {status === 'paid' && <Badge variant="secondary" className="bg-green-500/20 text-green-600">Pagado</Badge>}
      </div>

      {status === 'pending_payment' && (
        <Button 
          className="w-full" 
          disabled={loading}
          onClick={() => handleAction(() => sendPrizeEmail(matchday, userId), "Email enviado correctamente")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
          Enviar Email de Premio
        </Button>
      )}

      {status === 'notified' && (
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white" 
          disabled={loading}
          onClick={() => handleAction(() => markAsPaid(matchday, userId), "Marcado como pagado")}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          Marcar como Pagado
        </Button>
      )}
    </>
  );
}
