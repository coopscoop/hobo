import { getPlayerGameLog } from '@/lib/db/queries/players';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
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

        const { searchParams } = new URL(request.url);
        const yearParam = searchParams.get('year');

        const year = yearParam
            ? Number(yearParam)
            : undefined;

        if (
            year !== undefined &&
            !Number.isInteger(year)
        ) {
            return NextResponse.json(
                { message: 'Invalid year' },
                { status: 400 },
            );
        }

        const games = await getPlayerGameLog(
            playerId,
            year,
        );

        return NextResponse.json(games);
    } catch (error) {
        console.error('Failed to fetch player game log:', error);

        return NextResponse.json(
            { message: 'Failed to fetch player game log' },
            { status: 500 },
        );
    }
}
