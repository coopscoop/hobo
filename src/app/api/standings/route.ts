import { NextResponse } from 'next/server'
import { getLeagueStandings } from '@/lib/db/queries/teams'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const leagueId = searchParams.get('leagueId') 
    ? Number(searchParams.get('leagueId')) 
    : 2
  
  const standings = await getLeagueStandings(leagueId)
  return NextResponse.json(standings)
}
