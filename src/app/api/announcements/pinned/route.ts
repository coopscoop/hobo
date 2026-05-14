import { getPinnedAnnouncements } from '@/db/queries/announcements';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getPinnedAnnouncements();
  return NextResponse.json(data);
}
