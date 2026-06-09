"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, MessageSquareOff } from 'lucide-react';

export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUsers = async () => {
    setIsLoading(true);
    
    // 1. Obtener partidos urgentes (la próxima fecha/jornada activa)
    const { data: nextMatchData } = await supabase
      .from('matches')
      .select('kickoff_time')
      .eq('status', 'pending')
      .order('kickoff_time', { ascending: true })
      .limit(1)
      .single();

    let urgentMatchIds: number[] = [];
    if (nextMatchData?.kickoff_time) {
      // Tomamos los partidos pendientes dentro de las 24hs siguientes al próximo partido
      const nextMatchTime = new Date(nextMatchData.kickoff_time).getTime();
      const cutoffTime = new Date(nextMatchTime + 24 * 60 * 60 * 1000).toISOString();
      
      const { data: urgentMatchesData } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'pending')
        .lte('kickoff_time', cutoffTime);
        
      if (urgentMatchesData) {
        urgentMatchIds = urgentMatchesData.map(m => m.id);
      }
    }

    // 2. Obtener usuarios y sus pronósticos
    try {
      const { getAdminUsersAction } = await import('@/app/admin/actions');
      const profiles = await getAdminUsersAction();
      // 3. Calcular faltantes
      const processedUsers = (profiles || []).map((user: any) => {
        const userPreds = user.predictions || [];
        const totalPreds = userPreds.length;
        
        let missingUrgent = 0;
        if (urgentMatchIds.length > 0) {
          const predictedMatchIds = new Set(userPreds.map((p: any) => p.match_id));
          missingUrgent = urgentMatchIds.filter(id => !predictedMatchIds.has(id)).length;
        }

        return {
          ...user,
          total_predictions: totalPreds,
          missing_urgent: missingUrgent
        };
      });
      setUsers(processedUsers);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePayment = async (userId: string, field: 'paid_groups' | 'paid_knockouts', currentValue: boolean) => {
    const updateData: any = { [field]: !currentValue };
    // If we are setting it to paid, clear the notification flag
    if (!currentValue) {
      updateData.payment_notified = false;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
    if (error) {
      alert("Error al actualizar pago.");
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, ...updateData } : u));
    }
  };

  const handleToggleChatBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const { toggleChatBlockAction } = await import('@/app/admin/actions');
      await toggleChatBlockAction(userId, currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, chat_blocked: !currentStatus } : u));
    } catch (error: any) {
      alert("Error al actualizar bloqueo de chat: " + error.message);
    }
  };

  const handleSendReminder = async (email: string, name: string) => {
    try {
      const { sendReminderEmailAction } = await import('@/app/admin/actions');
      const res = await sendReminderEmailAction(email, name);
      if (!res.success) {
        alert("Error al enviar recordatorio: " + res.error);
      } else {
        alert("Recordatorio enviado a " + email);
      }
    } catch (error: any) {
      alert("Error al enviar recordatorio: " + error.message);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-secondary-foreground font-bold border-b border-border/50">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Pronósticos</th>
              <th className="px-4 py-3 text-center">Fase Grupos</th>
              <th className="px-4 py-3 text-center">Fase Eliminatoria</th>
              <th className="px-4 py-3 text-center">Chat</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-border/20 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  {user.name || 'Sin Nombre'}
                  {user.nickname && <span className="block text-xs text-muted-foreground mt-0.5">Apodo: {user.nickname}</span>}
                  {user.payment_notified && (!user.paid_groups || !user.paid_knockouts) && (
                    <span className="inline-block bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded mt-1">Avisó Pago</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold">{user.total_predictions || 0} / 72</span>
                    {user.missing_urgent > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                          Faltan {user.missing_urgent} de HOY
                        </span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleSendReminder(user.email, user.name)} 
                          title="Enviar recordatorio de urgencia"
                        >
                          <Bell className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                    {user.missing_urgent === 0 && (user.total_predictions || 0) < 72 && (
                      <Button size="icon" variant="ghost" className="h-6 w-6 mt-1" onClick={() => handleSendReminder(user.email, user.name)} title="Enviar recordatorio general">
                        <Bell className="w-3 h-3 text-yellow-500" />
                      </Button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button 
                    size="sm" 
                    variant={user.paid_groups ? 'default' : 'outline'}
                    onClick={() => togglePayment(user.id, 'paid_groups', user.paid_groups)}
                    className={user.paid_groups ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                  >
                    {user.paid_groups ? 'Pagado' : 'Pendiente'}
                  </Button>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button 
                    size="sm" 
                    variant={user.paid_knockouts ? 'default' : 'outline'}
                    onClick={() => togglePayment(user.id, 'paid_knockouts', user.paid_knockouts)}
                    className={user.paid_knockouts ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                  >
                    {user.paid_knockouts ? 'Pagado' : 'Pendiente'}
                  </Button>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button 
                    size="sm" 
                    variant={user.chat_blocked ? 'destructive' : 'outline'}
                    onClick={() => handleToggleChatBlock(user.id, user.chat_blocked || false)}
                    title={user.chat_blocked ? 'Chat bloqueado. Clic para habilitar.' : 'Chat habilitado. Clic para bloquear.'}
                  >
                    {user.chat_blocked ? <MessageSquareOff className="w-4 h-4 mr-1" /> : null}
                    {user.chat_blocked ? 'Bloqueado' : 'Habilitado'}
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
