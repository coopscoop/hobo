import { NextResponse } from 'next/server'
import { getLeagueById, updateLeague, deleteLeague } from '@/lib/db/queries/leagues'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data = await getLeagueById(Number(params.id))
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const [league] = await updateLeague(Number(params.id), body)
  return NextResponse.json(league)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await deleteLeague(Number(params.id))
  return new NextResponse(null, { status: 204 })
}
