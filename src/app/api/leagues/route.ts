import { NextResponse } from 'next/server'
import { getLeagues, createLeague } from '@/lib/db/queries/leagues'

export async function GET() {
  const data = await getLeagues()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [league] = await createLeague(body)
  return NextResponse.json(league, { status: 201 })
}
