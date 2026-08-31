import { NextRequest, NextResponse } from 'next/server';
import { getPlayersWithStats } from '@/lib/db/queries/players';

function parseYear(value: string | null): number | undefined {
    if (!value) return undefined;

    const year = Number(value);

    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
        return undefined;
    }

    return year;
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const yearFrom = parseYear(searchParams.get('yearFrom'));
    const yearTo = parseYear(searchParams.get('yearTo'));

    if (
        searchParams.has('yearFrom') &&
        yearFrom === undefined
    ) {
        return NextResponse.json(
            { error: 'Invalid yearFrom' },
            { status: 400 },
        );
    }

    if (
        searchParams.has('yearTo') &&
        yearTo === undefined
    ) {
        return NextResponse.json(
            { error: 'Invalid yearTo' },
            { status: 400 },
        );
    }

    if (
        yearFrom !== undefined &&
        yearTo !== undefined &&
        yearFrom > yearTo
    ) {
        return NextResponse.json(
            { error: 'yearFrom cannot be greater than yearTo' },
            { status: 400 },
        );
    }

    const players = await getPlayersWithStats(
        yearFrom,
        yearTo,
    );

    return NextResponse.json(players);
}
