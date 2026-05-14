import { getRecentGames } from '@/db/queries/games';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get('leagueId');
  const games = await getRecentGames(leagueId);
  return NextResponse.json(games);
}
