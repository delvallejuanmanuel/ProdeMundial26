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
    const { data, error } = await supabase
      .from('profiles')
      .select('*, predictions(count)')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setUsers(data || []);
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
      await sendReminderEmailAction(email, name);
      alert("Recordatorio enviado a " + email);
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
                    <span className="text-xs font-bold">{user.predictions?.[0]?.count || 0} / 72</span>
                    {(user.predictions?.[0]?.count || 0) < 72 && (
                      <Button size="icon" variant="ghost" onClick={() => handleSendReminder(user.email, user.name)} title="Enviar recordatorio">
                        <Bell className="w-4 h-4 text-yellow-500" />
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
