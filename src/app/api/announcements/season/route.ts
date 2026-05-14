import { getSeasonAnnouncements } from '@/db/queries/announcements';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getSeasonAnnouncements();
  return NextResponse.json(data);
}
