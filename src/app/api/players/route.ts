import { getPlayersWithStats } from '@/db/queries/players';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const yearFrom = req.nextUrl.searchParams.get('yearFrom');
  const yearTo   = req.nextUrl.searchParams.get('yearTo');

  const players = await getPlayersWithStats({
    yearFrom: yearFrom ?? null,
    yearTo:   yearTo ?? null,
  });

  return NextResponse.json(players);
}
