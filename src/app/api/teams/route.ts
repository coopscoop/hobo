import { NextRequest, NextResponse } from 'next/server'
import { getTeams, createTeam } from '@/lib/db/queries/teams'

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get('leagueId')
  const data = await getTeams(leagueId)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [team] = await createTeam(body)
  return NextResponse.json(team, { status: 201 })
}
