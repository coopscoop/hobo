import { getTeamById } from '@/db/queries/teams';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { id } = req.nextUrl.searchParams;

    if (!id) return NextResponse.json({ error: 'Missing team id' });

    const team = await getTeamById(parseInt(id));
    return NextResponse.json(team);
}
