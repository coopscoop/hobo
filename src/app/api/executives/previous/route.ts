import { getPreviousExecutives } from '@/db/queries/executives';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getPreviousExecutives();
  return NextResponse.json(data);
}
