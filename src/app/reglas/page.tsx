import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, ShieldAlert, Coins } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { createClient } from '@/utils/supabase/server';

export default async function ReglasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('is_admin').eq('id', user.id).single() : { data: null };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header isAdmin={profile?.is_admin} isLoggedIn={!!user} />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8 flex-1">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground">Reglas del Prode</h1>
        <p className="text-muted-foreground">Términos, condiciones y sistema de puntuación.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Premios y Pozo */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Coins className="w-5 h-5" />
              Premios y Pozo Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>El costo de inscripción total del Prode se divide en dos tramos (que pueden abonarse como 2 cuotas de $20.000 ARS o un pago único unificado de $40.000 ARS). Todo lo recaudado forma el <strong>Pozo Acumulado</strong>.</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-bold text-foreground mb-2">Distribución del Pozo:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-foreground">30% del Pozo Total (Fase de Grupos):</strong> Se divide en 3 premios iguales (10% cada uno) para los jugadores que sumen más puntos en cada una de las fechas de grupos (Ganador Fecha 1, Ganador Fecha 2 y Ganador Fecha 3).</li>
                <li><strong className="text-foreground">70% del Pozo Total (Premio Global):</strong> Se otorga al final del torneo a los jugadores con más puntos acumulados en la general:
                  <ul className="list-disc list-inside ml-6 mt-1 space-y-0.5">
                    <li><strong className="text-foreground">70% de este pozo (49% del total):</strong> Para el <strong>Campeón del Prode (1° puesto)</strong>.</li>
                    <li><strong className="text-foreground">30% de este pozo (21% del total):</strong> Para el <strong>Subcampeón del Prode (2° puesto)</strong>.</li>
                  </ul>
                </li>
              </ul>
            </div>
            <p className="text-xs italic">* En caso de empate en el primer puesto de cualquiera de los premios, el monto correspondiente se dividirá en partes iguales entre los ganadores.</p>
          </CardContent>
        </Card>

        {/* Sistema de Puntuación */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="w-5 h-5" />
              Sistema de Puntuación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>Por cada partido podrás predecir el resultado. Dependiendo de tu acierto, sumarás diferentes puntos:</p>
            <ul className="list-none space-y-3">
              <li className="flex items-start gap-2">
                <span className="bg-green-500/20 text-green-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+5 pts</span>
                <span><strong>Acierto Exacto (Pleno):</strong> Acertaste el resultado exacto del partido (ej: Predijiste 2-1 y salió 2-1).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-yellow-500/20 text-yellow-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+3 pts</span>
                <span><strong>Diferencia de Goles:</strong> Acertaste al ganador y la diferencia de goles (ej: Predijiste 3-1 y salió 2-0, diferencia de +2) O acertaste que era un empate pero con distintos goles (ej: Predijiste 1-1 y salió 0-0).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500/20 text-blue-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+1 pt</span>
                <span><strong>Acierto de Tendencia:</strong> Acertaste al equipo ganador, pero no la diferencia de goles (ej: Predijiste 1-0 y salió 3-0).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-500/20 text-purple-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+5 pts</span>
                <span><strong>Pleno en Penales (Playoffs):</strong> En partidos de eliminatoria, si predices un empate y además aciertas quién avanza en la tanda de penales, obtienes un **Acierto Pleno (5 puntos)** directos. Si erras el ganador de la tanda, sumas 0 puntos.</span>
              </li>
            </ul>

            <div className="w-full h-px bg-border/50 my-4"></div>
            
            <p className="font-bold text-foreground">Pronósticos Especiales (Se otorgan al finalizar el Mundial):</p>
            <ul className="list-none space-y-3">
              <li className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-500 font-bold px-2 py-0.5 rounded text-xs">+10 pts</span>
                <span><strong>Campeón:</strong> Acertar el equipo que ganará la copa.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-500 font-bold px-2 py-0.5 rounded text-xs">+5 pts</span>
                <span><strong>Subcampeón:</strong> Acertar el equipo que perderá la final.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-500 font-bold px-2 py-0.5 rounded text-xs">+7 pts</span>
                <span><strong>Goleador del Torneo (Bota de Oro):</strong> Acertar el máximo anotador de la competición.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Reglas Adicionales */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <ShieldAlert className="w-5 h-5" />
              Condiciones Generales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground text-sm leading-relaxed">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Plazos de Partidos:</strong> Las predicciones se bloquean estrictamente **1 hora antes del inicio programado** de cada encuentro.</li>
              <li><strong>Plazos Especiales:</strong> Los pronósticos especiales se bloquean definitivamente al **inicio exacto del partido inaugural** de la Copa del Mundo.</li>
              <li><strong>Alargues:</strong> Para los partidos de <strong>eliminatorias</strong>, el resultado que cuenta para los goles es el de los <strong>90 minutos reglamentarios + el alargue (120 minutos)</strong>. Los penales solo definen el bono de avance cuando hay empate.</li>
              <li><strong>Empates en Posiciones:</strong> En caso de empate en puntos totales en la tabla de posiciones, el criterio de desempate será: mayor cantidad de "Plenos" (aciertos exactos), luego mayor cantidad de puntos por "Pronósticos Especiales".</li>
              <li><strong>Administración y Pagos:</strong> El administrador es el único facultado para validar y activar los permisos en la base de datos de manera definitiva. Las decisiones sobre la carga de resultados son definitivas.</li>
            </ul>
          </CardContent>
        </Card>

      </div>
      </div>
    </div>
  );
}
