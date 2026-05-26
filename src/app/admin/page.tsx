"use client";

import React, { useState } from 'react';
import { UsersTable } from '@/components/admin/UsersTable';
import { MatchesTable } from '@/components/admin/MatchesTable';
import { SpecialResultsForm } from '@/components/admin/SpecialResultsForm';
import { PlayersTable } from '@/components/admin/PlayersTable';
import { ShieldAlert, Users, Trophy, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'players' | 'specials'>('users');

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" /> Panel de Administrador
          </h1>
          <p className="text-muted-foreground">Centro de control del torneo. Maneja pagos, resultados y goles.</p>
        </div>
        
        <div className="flex flex-wrap bg-secondary/50 p-1 rounded-lg border border-border/50 gap-1">
          <Button 
            variant={activeTab === 'users' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 ${activeTab === 'users' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Users className="w-4 h-4" /> Usuarios
          </Button>
          <Button 
            variant={activeTab === 'matches' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 ${activeTab === 'matches' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Trophy className="w-4 h-4" /> Resultados
          </Button>
          <Button 
            variant={activeTab === 'players' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-2 ${activeTab === 'players' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Target className="w-4 h-4" /> Goleadores
          </Button>
          <Button 
            variant={activeTab === 'specials' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('specials')}
            className={`flex items-center gap-2 ${activeTab === 'specials' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
          >
            <Star className="w-4 h-4" /> Cierre
          </Button>
        </div>
      </div>

      <div className="pt-4">
        {activeTab === 'users' && <UsersTable />}
        {activeTab === 'matches' && <MatchesTable />}
        {activeTab === 'players' && <PlayersTable />}
        {activeTab === 'specials' && <SpecialResultsForm />}
      </div>

    </div>
  );
}

