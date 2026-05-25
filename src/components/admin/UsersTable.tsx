"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
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
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: !currentValue })
      .eq('id', userId);
    
    if (error) {
      alert("Error al actualizar pago.");
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, [field]: !currentValue } : u));
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
              <th className="px-4 py-3 text-center">Fase Grupos</th>
              <th className="px-4 py-3 text-center">Fase Eliminatoria</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-border/20 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium">{user.name || 'Sin Nombre'}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
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
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
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
