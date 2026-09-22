import { getPlayersWithStats } from '@/lib/db/queries/players';
import { loadPlayerFilters } from '@/lib/searchParams/players';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const filters = loadPlayerFilters(req.nextUrl.searchParams)
        const players = await getPlayersWithStats(filters)
        return NextResponse.json(players, { status: 200 })
    } catch (error) {
        console.error('GET /api/players/stats failed:', error)
        return NextResponse.json(
            { error: 'Internal server error while retrieving player stats.' },
            { status: 500 },
        )
    }
}
