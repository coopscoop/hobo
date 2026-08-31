import { NextResponse } from 'next/server'
import { getAnnouncementById, updateAnnouncement, deleteAnnouncement } from '@/lib/db/queries/announcements'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getAnnouncementById(Number(params.id))
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const [announcement] = await updateAnnouncement(Number(params.id), body)
  return NextResponse.json(announcement)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await deleteAnnouncement(Number(params.id))
  return new NextResponse(null, { status: 204 })
}
