import { getCurrentExecutives } from '@/lib/db/queries/executives';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getCurrentExecutives();
  return NextResponse.json(data);
}
