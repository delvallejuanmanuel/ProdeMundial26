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
            <p>El costo de inscripción total del Prode se divide en dos fases: Fase de Grupos y Eliminatorias. Todo lo recaudado forma el <strong>Pozo Acumulado</strong>.</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-bold text-foreground mb-2">Distribución del Pozo:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong className="text-foreground">30% del Pozo Total:</strong> Premio para el ganador de la <strong>Fase de Grupos</strong>. Quien sume más puntos al finalizar el último partido de esta fase (abarcando las 3 fechas de la fase de grupos) se lleva este premio.</li>
                <li><strong className="text-foreground">70% del Pozo Total:</strong> Premio <strong>Global</strong>. Se otorga al jugador que sume la mayor cantidad de puntos a lo largo de <strong>todo el torneo</strong> (Fase de Grupos + Eliminatorias + Final).</li>
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
            <p>Por cada partido podrás predecir el resultado exacto. Dependiendo de tu acierto, sumarás diferentes puntos:</p>
            <ul className="list-none space-y-3">
              <li className="flex items-start gap-2">
                <span className="bg-green-500/20 text-green-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+5 pts</span>
                <span><strong>Acierto Exacto:</strong> Acertaste el resultado exacto del partido (ej: Predijiste 2-1 y salió 2-1).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-yellow-500/20 text-yellow-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+3 pts</span>
                <span><strong>Acierto de Diferencia / Empate:</strong> Acertaste al ganador y la diferencia de goles (ej: Predijiste 3-1 y salió 2-0, diferencia de +2) O acertaste que era un empate pero con distintos goles (ej: Predijiste 1-1 y salió 0-0).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500/20 text-blue-500 font-bold px-2 py-0.5 rounded text-xs mt-0.5">+1 pt</span>
                <span><strong>Acierto de Tendencia:</strong> Acertaste al equipo ganador, pero no la diferencia de goles (ej: Predijiste 1-0 y salió 3-0).</span>
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
                <span><strong>Goleador del Torneo:</strong> Acertar el máximo anotador de la competición.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-purple-500/20 text-purple-500 font-bold px-2 py-0.5 rounded text-xs">+5 pts</span>
                <span><strong>Decepción del Torneo:</strong> Acertar un equipo "candidato" que quede eliminado en la Fase de Grupos.</span>
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
              <li><strong>Plazos:</strong> Las predicciones pueden guardarse y modificarse libremente <strong>hasta la hora exacta del comienzo de cada partido</strong>. Una vez que el partido inicia, la predicción se bloquea y no puede alterarse.</li>
              <li><strong>Alargues:</strong> Para los partidos de <strong>eliminatorias</strong>, el resultado que cuenta para los puntos es el de los <strong>90 minutos reglamentarios + el alargue (120 minutos)</strong>. No se cuentan los penales para el resultado de goles.</li>
              <li><strong>Empates en Posiciones:</strong> En caso de empate en puntos totales en la tabla de posiciones, el criterio de desempate será: mayor cantidad de "Plenos" (aciertos exactos), luego mayor cantidad de puntos por "Pronósticos Especiales".</li>
              <li><strong>Administración:</strong> Las decisiones del administrador (como la carga final de resultados) son definitivas. Ante cualquier disputa o error en el sistema, el administrador tiene la autoridad final para resolver la discrepancia.</li>
              <li><strong>Fuerza Mayor:</strong> En caso de suspensión o cancelación de un partido, se determinará la conducta a seguir según la resolución oficial de la FIFA.</li>
            </ul>
          </CardContent>
        </Card>

      </div>
      </div>
    </div>
  );
}
