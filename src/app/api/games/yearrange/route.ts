import { getGameYearRange } from '@/db/queries/games';
import { NextResponse } from 'next/server';

export async function GET() {
  const range = await getGameYearRange();
  return NextResponse.json(range);
}
