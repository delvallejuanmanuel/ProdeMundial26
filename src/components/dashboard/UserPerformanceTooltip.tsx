"use client";

import React, { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface UserPerformanceTooltipProps {
  userId: string;
  userName: string;
  children: React.ReactNode;
}

export function UserPerformanceTooltip({ userId, userName, children }: UserPerformanceTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      if (!data) {
        fetchData();
      }
    }, 400); // 400ms delay to avoid accidental triggers
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: predictions } = await supabase
      .from('predictions')
      .select(`
        awarded_points,
        predicted_home_score,
        predicted_away_score,
        match:matches!inner (
          id, home_score, away_score, status, phase,
          home_team:teams!home_team_id (name, flag),
          away_team:teams!away_team_id (name, flag)
        )
      `)
      .eq('user_id', userId)
      .eq('match.status', 'finished')
      .order('id', { ascending: false });

    if (predictions) {
      setData(predictions);
    }
    setLoading(false);
  };

  const renderTooltipContent = () => {
    if (loading) return <div className="flex items-center justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
    if (!data || data.length === 0) return <div className="p-3 text-sm text-muted-foreground">No hay predicciones finalizadas.</div>;

    const plenos = data.filter(p => p.awarded_points === 5);
    const difGoles = data.filter(p => p.awarded_points === 3);
    const resultados = data.filter(p => p.awarded_points === 1);

    const renderMatches = (matches: any[], title: string, colorClass: string) => {
      if (matches.length === 0) return null;
      return (
        <div className="mb-3 last:mb-0">
          <div className={`text-xs font-bold ${colorClass} mb-1 uppercase tracking-wider`}>
            {title} ({matches.length})
          </div>
          <div className="space-y-1">
            {matches.slice(0, 3).map((p, i) => (
              <div key={i} className="text-xs flex items-center justify-between gap-4">
                <span className="text-muted-foreground truncate w-24">
                  {p.match.home_team.name.substring(0,3)} vs {p.match.away_team.name.substring(0,3)}
                </span>
                <span className="font-mono bg-background/50 px-1 rounded">
                  {p.match.home_score}-{p.match.away_score}
                </span>
              </div>
            ))}
            {matches.length > 3 && <div className="text-[10px] text-muted-foreground pt-1">+ {matches.length - 3} más</div>}
          </div>
        </div>
      );
    };

    return (
      <div className="p-3 w-48">
        <div className="font-bold border-b border-border/50 pb-2 mb-2 text-sm truncate">{userName}</div>
        {renderMatches(plenos, 'Plenos', 'text-green-500')}
        {renderMatches(difGoles, 'Dif. Goles', 'text-blue-500')}
        {renderMatches(resultados, 'Resultados', 'text-yellow-500')}
      </div>
    );
  };

  return (
    <>
      <div 
        onMouseEnter={handleMouseEnter} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={handleMouseLeave}
        className="inline-flex cursor-help items-center gap-2"
      >
        {children}
      </div>
      
      {isHovered && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-50 pointer-events-none bg-card/95 backdrop-blur-md border border-border/50 shadow-xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200"
          style={{ 
            left: Math.min(mousePos.x + 15, window.innerWidth - 220) + 'px', 
            top: Math.min(mousePos.y + 15, window.innerHeight - 300) + 'px' 
          }}
        >
          {renderTooltipContent()}
        </div>,
        document.body
      )}
    </>
  );
}
