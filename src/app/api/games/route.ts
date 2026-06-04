import { getGames } from '@/db/queries/games';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {

    try {
        const p = req.nextUrl.searchParams;
        const games = await getGames({
            leagueId: p.get('leagueId'),
            teamId: p.get('teamId'),
            dateFrom: p.get('dateFrom'),
            dateTo: p.get('dateTo'),
            playoff: p.get('playoff'),
        });

        // worst case return a 404 if no announcements are found
        if (!games) {
            return new Response(JSON.stringify({ message: "No games found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
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
            { error: 'Internal server error while retrieving games.' },
            { status: 500 }
        );
    }
}
