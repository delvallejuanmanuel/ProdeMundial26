"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentNotification({ 
  hasNotified, 
  userId 
}: { 
  hasNotified: boolean; 
  userId: string;
}) {
  const [isNotified, setIsNotified] = useState(hasNotified);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleNotify = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ payment_notified: true })
      .eq('id', userId);
      
    if (!error) {
      setIsNotified(true);
    } else {
      alert('Hubo un error al notificar el pago.');
    }
    setIsLoading(false);
  };

  if (isNotified) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex gap-3 text-sm text-green-500 mt-4 items-center">
        <Check className="w-5 h-5 shrink-0" />
        <p>
          <strong>Pago Notificado:</strong> El administrador está verificando tu transferencia. Pronto activará tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border/50 p-4 rounded-xl flex flex-col gap-3 mt-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <input 
          type="checkbox" 
          className="mt-1 w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
          onChange={(e) => {
            if (e.target.checked) handleNotify();
          }}
          disabled={isLoading}
        />
        <span className="text-sm">
          <strong>Ya realicé el pago.</strong> Al marcar esta casilla, se notificará al administrador para que verifique la transferencia y habilite tu cuenta.
        </span>
      </label>
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Notificando...
        </div>
      )}
    </div>
  );
}
