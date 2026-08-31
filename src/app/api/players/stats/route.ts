import { getPlayersWithStats } from '@/lib/db/queries/players';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const yearFromParam = searchParams.get('yearFrom');
        const yearToParam = searchParams.get('yearTo');

        const yearFrom = yearFromParam
            ? Number(yearFromParam)
            : undefined;

        const yearTo = yearToParam
            ? Number(yearToParam)
            : undefined;

        if (
            yearFrom !== undefined &&
            yearTo !== undefined &&
            yearFrom > yearTo
        ) {
            return NextResponse.json(
                {
                    message:
                        'yearFrom must be less than or equal to yearTo',
                },
                { status: 400 },
            );
        }

        const players = await getPlayersWithStats(
            yearFrom,
            yearTo,
        );

        return NextResponse.json(players, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch player stats:', error);

        return NextResponse.json(
            { message: 'Failed to fetch player stats' },
            { status: 500 },
        );
    }
}
