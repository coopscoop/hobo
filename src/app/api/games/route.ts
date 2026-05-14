import { getGames } from '@/db/queries/games';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const games = await getGames({
    leagueId: p.get('leagueId'),
    teamId: p.get('teamId'),
    dateFrom: p.get('dateFrom'),
    dateTo: p.get('dateTo'),
    playoff: p.get('playoff'),
  });
  return NextResponse.json(games);
}
