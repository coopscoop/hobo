import { NextResponse } from 'next/server'
import { getTeams, createTeam } from '@/lib/db/queries/teams'

export async function GET() {
  const data = await getTeams()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [team] = await createTeam(body)
  return NextResponse.json(team, { status: 201 })
}
