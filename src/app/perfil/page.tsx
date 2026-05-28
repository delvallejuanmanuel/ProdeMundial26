import React from 'react';
import { Header } from '@/components/layout/Header';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { User, CreditCard, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, Phone, Info, Trophy, Target, Medal, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { NicknameForm } from './NicknameForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.is_admin || false;
  const hasPaidGroups = profile?.paid_groups || false;
  const hasPaidKnockouts = profile?.paid_knockouts || false;

  // Fetch leaderboard to calculate rank and get stats
  const { data: leaderboard } = await supabase
    .from('v_leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .order('exact_matches', { ascending: false })
    .order('special_points', { ascending: false });

  const userStats = leaderboard?.find(u => u.user_id === user.id);
  const userRank = leaderboard?.findIndex(u => u.user_id === user.id) !== undefined && leaderboard!.findIndex(u => u.user_id === user.id) !== -1 
    ? (leaderboard!.findIndex(u => u.user_id === user.id) + 1) 
    : '-';
  
  // URL to generate MP QR using a generic public API for the alias text
  const mpAlias = "prode.mundial.2026";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mpAlias)}&bgcolor=1a1a1a&color=ffffff`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
            <User className="w-8 h-8 text-primary" /> Mi Perfil
          </h1>
          <p className="text-muted-foreground">Gestiona tu cuenta y el estado de tu inscripción al Prode Mundial.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Info de Cuenta y Estado */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="w-16 h-16 bg-secondary text-primary rounded-full flex items-center justify-center mb-4 text-2xl font-black border-2 border-primary/20">
                {(profile?.nickname || profile?.name)?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-bold">{profile?.nickname ? `${profile.nickname} (${profile.name})` : profile?.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{profile?.email}</p>

              {userStats && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-background/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Hash className="w-5 h-5 text-primary mb-1" />
                    <span className="text-2xl font-black">{userRank}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Posición</span>
                  </div>
                  <div className="bg-background/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                    <span className="text-2xl font-black">{userStats.total_score}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Puntos</span>
                  </div>
                  <div className="bg-background/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Target className="w-5 h-5 text-green-500 mb-1" />
                    <span className="text-2xl font-black">{userStats.exact_matches}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Plenos</span>
                  </div>
                  <div className="bg-background/50 border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Medal className="w-5 h-5 text-purple-500 mb-1" />
                    <span className="text-2xl font-black">{userStats.special_points}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Especiales</span>
                  </div>
                </div>
              )}

              <NicknameForm currentNickname={profile?.nickname} />

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Estado de Inscripción</h3>
                  
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${hasPaidGroups ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                      {hasPaidGroups ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
                      <div className="flex-1">
                        <div className="font-bold text-sm">Fase de Grupos</div>
                        <div className="text-xs opacity-80">{hasPaidGroups ? 'Habilitado' : 'Pendiente de Pago'}</div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${hasPaidKnockouts ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
                      {hasPaidKnockouts ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
                      <div className="flex-1">
                        <div className="font-bold text-sm">Fase Eliminatoria</div>
                        <div className="text-xs opacity-80">{hasPaidKnockouts ? 'Habilitado' : 'Pendiente de Pago'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Pagos y Términos */}
          <div className="md:col-span-2 space-y-6">
            {(!hasPaidGroups || !hasPaidKnockouts) ? (
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-24 -mt-24 transition-all group-hover:bg-blue-500/20"></div>
                
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">Validar Inscripción</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  
                  <div className="flex-1 space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Para poder guardar tus pronósticos y participar por los premios, debes abonar la inscripción. Puedes pagar todo junto o en dos fases.
                    </p>

                    <div className="bg-background border border-border/50 rounded-xl p-4 space-y-2">
                      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Datos de Transferencia</div>
                      <div className="flex justify-between items-center pb-2 border-b border-border/20">
                        <span className="text-sm text-muted-foreground">Alias Mercado Pago</span>
                        <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded select-all">{mpAlias}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-muted-foreground">Titular</span>
                        <span className="font-bold">Admin Prode</span>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl flex gap-3 text-sm text-blue-400 mt-4">
                      <Info className="w-5 h-5 shrink-0" />
                      <p>
                        <strong>Importante:</strong> Luego de transferir, envíale el comprobante al administrador por WhatsApp indicando tu email de registro ({profile?.email}) para que active tu cuenta.
                      </p>
                    </div>

                  </div>

                  <div className="shrink-0 flex flex-col items-center p-4 bg-white rounded-xl shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="QR Mercado Pago" className="w-40 h-40" />
                    <div className="text-black font-bold mt-3 text-sm flex items-center gap-1">
                      <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-tighter">mp</span> Escanear para pagar
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                <h2 className="text-2xl font-black text-green-500">¡Todo en Regla!</h2>
                <p className="text-green-500/80 max-w-md">
                  Ya tienes todas las fases habilitadas. Estás participando oficialmente por el premio mayor. ¡Mucha suerte con tus pronósticos!
                </p>
              </div>
            )}

            {/* Términos y Condiciones */}
            <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                Términos y Condiciones
              </h3>
              <div className="text-xs text-muted-foreground space-y-3 bg-background/50 p-4 rounded-xl border border-border/30 h-48 overflow-y-auto">
                <p>1. <strong>Inscripción:</strong> La participación en el Prode Mundial 2026 requiere el pago previo de la inscripción estipulada. El no pago resultará en la inhabilitación para cargar o editar pronósticos.</p>
                <p>2. <strong>Plazos:</strong> Los pronósticos de cada partido podrán cargarse o modificarse hasta exactamente la hora de inicio (kick-off) del encuentro. Una vez iniciado, el partido queda bloqueado ("En Vivo").</p>
                <p>3. <strong>Puntajes:</strong> Se otorgan 3 puntos por acertar el resultado exacto, 2 puntos por acertar la diferencia de goles correcta (y el ganador), 1 punto por acertar solo ganador/empate, y 0 puntos en caso de no acertar. Los pronósticos especiales tienen puntajes fijos que se suman al finalizar el torneo.</p>
                <p>4. <strong>Premios:</strong> El pozo acumulado será distribuido entre los primeros puestos de la tabla de posiciones general (Leaderboard) según la estructura de premios definida por la administración al cierre de inscripciones.</p>
                <p>5. <strong>Empates:</strong> En caso de empate en puntos totales, el criterio de desempate será: mayor cantidad de "Plenos" (aciertos exactos), luego mayor cantidad de puntos por "Pronósticos Especiales".</p>
                <p>6. <strong>Administración:</strong> Las decisiones del administrador (como la carga final de resultados) son definitivas. Ante cualquier disputa o error en el sistema, el administrador tiene la autoridad final para resolver la discrepancia.</p>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
