import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API_FOOTBALL_KEY no está configurada en .env.local' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'fixtures'; // fixtures, scorers, squad
  const teamId = searchParams.get('team') || '25'; // Default to a random team (e.g. 25 is Argentina in API-Football)

  let endpoint = '';
  // Utilizaremos la liga 1 (Mundial) y temporada 2022 para tener datos reales, ya que 2026 aún no tiene datos completos.
  // Pero podemos intentar 2026 si queremos ver qué responde. Probemos 2022 para asegurar resultados.
  const league = 1;
  const season = 2022; // World Cup 2022 in Qatar to see real data structure

  switch (type) {
    case 'fixtures':
      // Traemos un par de partidos del mundial (ejemplo: Final o un partido específico)
      endpoint = `fixtures?league=${league}&season=${season}`;
      break;
    case 'scorers':
      endpoint = `players/topscorers?league=${league}&season=${season}`;
      break;
    case 'squad':
      endpoint = `players/squads?team=${teamId}`;
      break;
    default:
      endpoint = `fixtures?league=${league}&season=${season}`;
  }

  try {
    const response = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
      headers: {
        'x-apisports-key': apiKey,
      },
    });

    const data = await response.json();

    if (data.errors && Object.keys(data.errors).length > 0) {
       return NextResponse.json({ error: 'Error de la API', details: data.errors }, { status: 400 });
    }

    // Para evitar traer muchísimos datos que cuelguen el navegador, cortamos el array en caso de fixtures
    if (type === 'fixtures' && data.response && Array.isArray(data.response)) {
      data.response = data.response.slice(0, 3); // Solo los 3 primeros para analizar la estructura
    }

    return NextResponse.json({
      success: true,
      endpoint_called: endpoint,
      data: data.response,
    });

  } catch (error: any) {
    console.error("Test Football API Error:", error);
    return NextResponse.json(
      { error: 'Error de conexión', message: error.message },
      { status: 500 }
    );
  }
}
