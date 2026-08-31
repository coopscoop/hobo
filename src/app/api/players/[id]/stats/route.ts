import { getPlayerStatsById } from '@/lib/db/queries/players';
import { NextResponse } from 'next/server';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const playerId = Number(id);

        if (!Number.isInteger(playerId)) {
            return NextResponse.json(
                { message: 'Invalid player ID' },
                { status: 400 },
            );
        }

        const stats = await getPlayerStatsById(playerId);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to fetch player stats:', error);

        return NextResponse.json(
            { message: 'Failed to fetch player stats' },
            { status: 500 },
        );
    }
}
