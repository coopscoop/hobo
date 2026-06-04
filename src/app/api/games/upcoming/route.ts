import { getUpcomingGames } from '@/db/queries/games';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    try {
        const leagueId = req.nextUrl.searchParams.get('leagueId');
        const games = await getUpcomingGames(leagueId);

        // worst case return a 404 if no announcements are found
        if (!games) {
            return new Response(JSON.stringify({ message: "No announcements found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return NextResponse.json(games, { status: 200 });
    } catch (error) {
        // on error, return a 400/500 with the error message
        if (error instanceof Error && error.message === 'Invalid resource ID format.') {
            return NextResponse.json(
                { error: 'Invalid resource ID format.' },
                { status: 400 }
            );
        }

        console.error("API Error:", error);
        return NextResponse.json(
            { error: 'Internal server error while retrieving announcements.' },
            { status: 500 }
        );
    }
}
