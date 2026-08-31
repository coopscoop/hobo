import { NextResponse } from 'next/server'
import { getAnnouncements, createAnnouncement } from '@/lib/db/queries/announcements'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pinned = searchParams.get('pinned') === 'true' ? true : 
                 searchParams.get('pinned') === 'false' ? false : undefined
  const type = searchParams.get('type') || undefined
  
  const data = await getAnnouncements({ pinned, type })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [announcement] = await createAnnouncement(body)
  return NextResponse.json(announcement, { status: 201 })
}
