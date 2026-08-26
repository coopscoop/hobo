import { getGameById } from '@/db/queries/games';
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db';
import { games, batting, substitutes } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const gameId = Number(id);

        if (!gameId || Number.isNaN(gameId)) {
            return NextResponse.json(
                { error: 'Invalid game id' },
                { status: 400 }
            );
        }

        // guard: don't allow deleting a game that already has batting data
        // entered — that's real scorecard data, not just a scheduling stub
        const existingBatting = await db
            .select({ id: batting.id })
            .from(batting)
            .where(eq(batting.gameId, gameId))
            .limit(1);

        if (existingBatting.length > 0) {
            return NextResponse.json(
                {
                    error:
                        'This game has batting data entered and cannot be deleted. Remove the score sheet data first.',
                },
                { status: 409 }
            );
        }

        // clean up substitutes tied to this game first (FK dependency),
        // then the game row itself
        await db.delete(substitutes).where(eq(substitutes.gameId, gameId));

        const deleted = await db
            .delete(games)
            .where(eq(games.id, gameId))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, id: gameId }, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('DELETE /api/games/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to delete game',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}

