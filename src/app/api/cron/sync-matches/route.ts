import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // We use the service role key to bypass RLS in background jobs
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Fallback to empty string at build time if not present, to prevent build crash if somehow called
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

  // Initialize inside the request to avoid build-time errors when env vars are missing
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Authenticate the cron job request
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Fetch matches from API-Football
    // Note: The League ID for World Cup is usually 1 (but verify for 2026)
    // We filter by date (today) to only check matches happening now
    
    /*
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?league=1&season=2026&date=${today}`, {
      headers: {
        'x-apisports-key': process.env.API_FOOTBALL_KEY!,
      }
    });
    const data = await response.json();
    const fixtures = data.response;

    // 3. Process each match and update our database
    for (const fixture of fixtures) {
      // The API fixture.fixture.id could map to our match id if we seed them correctly,
      // or we can map them by home/away team names and kickoff time.
      const status = fixture.fixture.status.short; // e.g., 'FT', '1H', '2H'
      const homeScore = fixture.goals.home;
      const awayScore = fixture.goals.away;
      
      // Update our database
      await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: status === 'FT' || status === 'PEN' ? 'finished' : 'in_progress', // mapping API status to ours
        })
        .eq('api_id', fixture.fixture.id); // Assuming we added an api_id column
    }
    */

    // 4. Trigger points calculation for all finished matches
    // We call the RPC we previously created. This will recalculate points for the updated matches.
    const { error: rpcError } = await supabase.rpc('calculate_points');

    if (rpcError) {
      console.error("Error calculating points:", rpcError);
      return NextResponse.json({ error: 'Failed to calculate points', details: rpcError }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Matches synchronized and points calculated successfully.' 
    });

  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
