import { getGameById } from '@/db/queries/games';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const player = await getGameById(id);

        if (!player) {
            return new Response(JSON.stringify({ message: "No game found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return NextResponse.json(player, { status: 200 });
    } catch (error) {
        // Check if the error is the specific format error we are looking for
        if (error instanceof Error && error.message === 'Invalid resource ID format.') {
            return NextResponse.json(
                { error: 'Invalid resource ID format.' },
                { status: 400 }
            );
        }

        // Handle other internal errors (e.g., database connection failure)
        console.error("API Error:", error);
        return NextResponse.json(
            { error: 'Internal server error while retrieving game.' },
            { status: 500 }
        );
    }
}
