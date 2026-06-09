"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SpecialsReminderPopup({ show }: { show: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (show && typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem('specials_reminder_seen');
      if (!hasSeen) {
        setIsOpen(true);
        sessionStorage.setItem('specials_reminder_seen', 'true');
      }
    }
  }, [show]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-card border border-primary/20 shadow-2xl rounded-2xl max-w-md w-full overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-primary to-purple-500"></div>
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Star className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">¡No te olvides!</h2>
          <p className="text-muted-foreground">
            Aún no completaste tus <strong>Pronósticos Especiales</strong> (Campeón, Subcampeón y Goleador). 
          </p>
          <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-3 rounded-lg flex items-start gap-2 text-sm text-left">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Estas opciones se bloquean en cuanto empiece el Mundial. ¡Hacelo ahora porque dan <strong>muchísimos puntos extra</strong> al final!</p>
          </div>
          <div className="pt-4 flex flex-col gap-2">
            <Link href="/especiales" onClick={() => setIsOpen(false)}>
              <Button className="w-full text-lg font-bold h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                Completar Especiales Ahora
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-muted-foreground">
              Recordarme más tarde
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
