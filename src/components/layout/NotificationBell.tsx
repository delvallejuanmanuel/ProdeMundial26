"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const past48h = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

      // Fetch predictions with awarded points in the last 48hs
      const { data } = await supabase
        .from('predictions')
        .select(`
          awarded_points,
          match:matches!inner(
            id, kickoff_time,
            home:teams!home_team_id(name),
            away:teams!away_team_id(name)
          )
        `)
        .eq('user_id', user.id)
        .gt('awarded_points', 0)
        .gte('match.kickoff_time', past48h)
        .order('match(kickoff_time)', { ascending: false });

      if (data) {
        setNotifications(data);
      }
      setLoading(false);
    }

    fetchNotifications();
  }, []);

  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative outline-none">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full animate-ping"></span>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full"></span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>Tus aciertos (Últimas 48hs)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Cargando...</div>
        ) : hasNotifications ? (
          notifications.map((notif, i) => (
            <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3">
              <span className="text-sm font-medium">
                {notif.match.home?.name || 'Local'} vs {notif.match.away?.name || 'Visita'}
              </span>
              <span className="text-xs text-primary font-bold">
                ¡Sumaste +{notif.awarded_points} pts!
              </span>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No tienes aciertos recientes.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
