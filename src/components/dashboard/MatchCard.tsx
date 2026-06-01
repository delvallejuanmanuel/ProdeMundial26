"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Check } from 'lucide-react';

interface MatchCardProps {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  matchDate: string;
  matchTime: string;
  groupName: string;
  status: 'pending' | 'in_play' | 'finished';
  initialHomeScore?: number | null;
  initialAwayScore?: number | null;
  userId?: string | null;
  hasPaid?: boolean;
  actualHomeScore?: number | null;
  actualAwayScore?: number | null;
  awardedPoints?: number | null;
  kickoffTime?: string;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  initialPenaltiesWinner?: number | null;
  winnerByPenaltiesTeamId?: number | null;
}

export function MatchCard({
  matchId,
  homeTeam,
  awayTeam,
  homeFlag,
  awayFlag,
  matchDate,
  matchTime,
  groupName,
  status,
  initialHomeScore = null,
  initialAwayScore = null,
  userId = null,
  hasPaid = false,
  actualHomeScore = null,
  actualAwayScore = null,
  awardedPoints = null,
  kickoffTime = '',
  homeTeamId = null,
  awayTeamId = null,
  initialPenaltiesWinner = null,
  winnerByPenaltiesTeamId = null
}: MatchCardProps) {
  // Lock logic: 1 hour before kickoff
  const isTimeLocked = kickoffTime ? new Date(kickoffTime).getTime() - new Date().getTime() <= 60 * 60 * 1000 : false;
  const isLocked = status !== 'pending' || !hasPaid || isTimeLocked;
  
  const [homeScore, setHomeScore] = useState<number | string>(initialHomeScore ?? '');
  const [awayScore, setAwayScore] = useState<number | string>(initialAwayScore ?? '');
  const [penaltiesWinner, setPenaltiesWinner] = useState<number | string>(initialPenaltiesWinner ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isPlayoff = !groupName.startsWith('GRUPO');
  const isTie = homeScore !== '' && awayScore !== '' && Number(homeScore) === Number(awayScore);

  const handleSave = async () => {
    if (!userId) {
      alert("Debes iniciar sesión para guardar un pronóstico.");
      return;
    }
    
    if (!hasPaid) {
      alert("Debes validar tu pago con el administrador para cargar pronósticos.");
      return;
    }
    
    if (homeScore === '' || awayScore === '') {
      alert("Por favor ingresa ambos resultados.");
      return;
    }

    if (isPlayoff && isTie && !penaltiesWinner) {
      alert("Para partidos de eliminatoria que terminen en empate, debes elegir qué equipo avanza por penales.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    
    const supabase = createClient();
    
    const { error } = await supabase
      .from('predictions')
      .upsert({
        user_id: userId,
        match_id: matchId,
        predicted_home_score: Number(homeScore),
        predicted_away_score: Number(awayScore),
        predicted_penalties_winner_team_id: isPlayoff && isTie && penaltiesWinner ? Number(penaltiesWinner) : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, match_id' });

    setIsSaving(false);

    if (error) {
      console.error(error);
      alert("Error al guardar el pronóstico. ¿Has abonado la inscripción?");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const pointsColor = awardedPoints === 5 ? 'text-green-400 bg-green-500/15 border-green-500/30' 
    : awardedPoints === 3 ? 'text-blue-400 bg-blue-500/15 border-blue-500/30'
    : awardedPoints === 1 ? 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
    : 'text-red-400 bg-red-500/15 border-red-500/30';

  return (
    <Card className={`w-full max-w-md mx-auto bg-card border-border/50 transition-colors shadow-lg overflow-hidden ${hasPaid ? 'hover:border-primary/50' : 'opacity-80 grayscale-[20%]'}`}>
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b border-border/20 bg-background/50">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border/50">
            {groupName}
          </Badge>
          {status === 'in_play' && (
            <Badge className="bg-primary text-primary-foreground animate-pulse text-xs">En Vivo</Badge>
          )}
          {status === 'finished' && (
            <Badge variant="secondary" className="text-xs">Finalizado</Badge>
          )}
          {status === 'pending' && isTimeLocked && (
            <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
          )}
        </div>
        <div className="text-xs font-semibold text-muted-foreground text-right">
          <div>{matchDate}</div>
          <div className="text-primary">{matchTime} ART</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-6">
        <div className="flex items-center justify-between">
          
          {/* Home Team */}
          <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary text-2xl border-2 border-border/50 shadow-inner overflow-hidden">
              {homeFlag.startsWith('http') ? <img src={homeFlag} alt={homeTeam} className="w-full h-full object-cover" /> : homeFlag}
            </div>
            <span className="font-bold text-sm leading-tight">{homeTeam}</span>
          </div>

          {/* Score / Inputs */}
          <div className="flex items-center justify-center space-x-3 w-1/3">
            <input 
              type="number" 
              min="0" 
              max="15"
              disabled={isLocked || isSaving}
              value={homeScore}
              onChange={(e) => {
                setHomeScore(e.target.value);
                if (e.target.value !== awayScore) setPenaltiesWinner('');
              }}
              placeholder="-"
              className="w-12 h-14 bg-background border border-border/50 rounded-lg text-center text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all disabled:cursor-not-allowed"
            />
            <span className="text-muted-foreground font-bold">:</span>
            <input 
              type="number" 
              min="0" 
              max="15"
              disabled={isLocked || isSaving}
              value={awayScore}
              onChange={(e) => {
                setAwayScore(e.target.value);
                if (e.target.value !== homeScore) setPenaltiesWinner('');
              }}
              placeholder="-"
              className="w-12 h-14 bg-background border border-border/50 rounded-lg text-center text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all disabled:cursor-not-allowed"
            />
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center space-y-2 w-1/3 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary text-2xl border-2 border-border/50 shadow-inner overflow-hidden">
              {awayFlag.startsWith('http') ? <img src={awayFlag} alt={awayTeam} className="w-full h-full object-cover" /> : awayFlag}
            </div>
            <span className="font-bold text-sm leading-tight">{awayTeam}</span>
          </div>
        </div>

        {/* Penalty winner selection for playoff draws */}
        {isPlayoff && isTie && (
          <div className="mt-4 pt-4 border-t border-border/20 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-bold text-center text-muted-foreground uppercase tracking-wider">
              ¿Quién avanza? (Penales o suplementario)
            </p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                disabled={isLocked || isSaving}
                onClick={() => setPenaltiesWinner(homeTeamId ?? '')}
                className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg border transition-all ${
                  (penaltiesWinner !== '' && Number(penaltiesWinner) === Number(homeTeamId))
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(130,255,145,0.2)]'
                    : 'bg-background border-border hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                {homeTeam}
              </button>
              <button
                type="button"
                disabled={isLocked || isSaving}
                onClick={() => setPenaltiesWinner(awayTeamId ?? '')}
                className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg border transition-all ${
                  (penaltiesWinner !== '' && Number(penaltiesWinner) === Number(awayTeamId))
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(130,255,145,0.2)]'
                    : 'bg-background border-border hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                {awayTeam}
              </button>
            </div>
          </div>
        )}

        {status === 'finished' && actualHomeScore != null && actualAwayScore != null && (
          <div className="mt-4 pt-3 border-t border-border/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resultado Real</span>
              <span className="text-lg font-black text-foreground">{actualHomeScore} - {actualAwayScore}</span>
            </div>
            
            {actualHomeScore === actualAwayScore && winnerByPenaltiesTeamId && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">Ganador Penales Real</span>
                <span className="font-bold text-foreground">
                  {Number(winnerByPenaltiesTeamId) === Number(homeTeamId) ? homeTeam : awayTeam}
                </span>
              </div>
            )}

            {initialPenaltiesWinner && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider">Tu Elegido Penales</span>
                <span className={`font-bold ${Number(initialPenaltiesWinner) === Number(winnerByPenaltiesTeamId) ? 'text-green-500' : 'text-red-500'}`}>
                  {Number(initialPenaltiesWinner) === Number(homeTeamId) ? homeTeam : awayTeam}
                </span>
              </div>
            )}

            {awardedPoints != null && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tu Pronóstico</span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full border ${pointsColor}`}>
                  +{awardedPoints} {awardedPoints === 1 ? 'punto' : 'puntos'}
                </span>
              </div>
            )}
          </div>
        )}

        {(!isLocked && hasPaid) ? (
          <div className="mt-6">
            <Button 
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`w-full font-bold transition-all shadow-lg ${
                saveSuccess 
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' 
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(130,255,145,0.3)]'
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saveSuccess ? (
                <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Guardado</span>
              ) : (
                'Guardar Pronóstico'
              )}
            </Button>
          </div>
        ) : (status === 'pending' && isTimeLocked) && (
          <div className="mt-4 pt-2 border-t border-border/20 text-center">
            <p className="text-xs text-muted-foreground font-semibold">El tiempo para cargar el pronóstico de este partido ha finalizado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
