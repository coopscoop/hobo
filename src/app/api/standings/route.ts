import { NextRequest, NextResponse } from 'next/server';
import { getLeagueStandings } from '@/lib/db/queries/teams';
import type { StandingType } from '@/lib/types';

const standingTypes = ['all', 'regular', 'playoffs'] as const;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const leagueIdParam = searchParams.get('leagueId');
    const typeParam = searchParams.get('type') ?? 'all';
    const yearParam = searchParams.get('year') ?? '2026';

    const leagueId = leagueIdParam
        ? Number(leagueIdParam)
        : 2;

    if (
        leagueIdParam !== null &&
        (!Number.isInteger(leagueId) || leagueId <= 0)
    ) {
        return NextResponse.json(
            { error: 'Invalid leagueId' },
            { status: 400 }
        );
    }

    if (!standingTypes.includes(typeParam as StandingType)) {
        return NextResponse.json(
            { error: 'Invalid standings type' },
            { status: 400 }
        );
    }

    const year = Number(yearParam);

    if (
        !Number.isInteger(year) ||
        year < 2000 ||
        year > 2100
    ) {
        return NextResponse.json(
            { error: 'Invalid year' },
            { status: 400 }
        );
    }

    const standings = await getLeagueStandings({
        leagueId,
        type: typeParam as StandingType,
        year,
    });

    return NextResponse.json(standings);
}
