import { getRecentGames } from '@/db/queries/games';
import { NextResponse } from 'next/server';

export async function GET() {

    try {
        const announcements = await getRecentGames();

        // worst case return a 404 if no announcements are found
        if (!announcements) {
            return new Response(JSON.stringify({ message: "No announcements found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return NextResponse.json(announcements, { status: 200 });
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
