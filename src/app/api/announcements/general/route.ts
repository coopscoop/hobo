import { getGeneralAnnouncements } from '@/db/queries/announcements';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getGeneralAnnouncements();
  return NextResponse.json(data);
}
