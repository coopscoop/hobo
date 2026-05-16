import { getAnnouncements } from '@/db/queries/announcements';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getAnnouncements();
  return NextResponse.json(data);
}
