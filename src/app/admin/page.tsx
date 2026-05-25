"use client";

import React, { useState } from 'react';
import { UsersTable } from '@/components/admin/UsersTable';
import { MatchesTable } from '@/components/admin/MatchesTable';
import { SpecialResultsForm } from '@/components/admin/SpecialResultsForm';
import { ShieldAlert, Users, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'specials'>('users');

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" /> Panel de Administrador
          </h1>
          <p className="text-muted-foreground">Centro de control del torneo. Maneja pagos y resultados.</p>
        </div>
        
        <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50">
          <Button 
            variant={activeTab === 'users' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 ${activeTab === 'users' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Users className="w-4 h-4" /> Usuarios y Pagos
          </Button>
          <Button 
            variant={activeTab === 'matches' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 ${activeTab === 'matches' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Trophy className="w-4 h-4" /> Resultados
          </Button>
          <Button 
            variant={activeTab === 'specials' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('specials')}
            className={`flex items-center gap-2 ${activeTab === 'specials' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Star className="w-4 h-4" /> Cierre Torneo
          </Button>
        </div>
      </div>

      <div className="pt-4">
        {activeTab === 'users' ? <UsersTable /> : 
         activeTab === 'matches' ? <MatchesTable /> : 
         <SpecialResultsForm />}
      </div>

    </div>
  );
}
