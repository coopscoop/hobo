import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { substitutes, batting } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; subId: string }> }
) {
    try {
        const { id, subId: subIdParam } = await params;
        const gameId = Number(id);
        const subId = Number(subIdParam);

        if (!gameId || !subId || Number.isNaN(gameId) || Number.isNaN(subId)) {
            return NextResponse.json(
                { error: 'Invalid game id or substitute id' },
                { status: 400 }
            );
        }

        const deleted = await db
            .delete(substitutes)
            .where(
                and(eq(substitutes.id, subId), eq(substitutes.gameId, gameId))
            )
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json(
                { error: 'Substitute not found for this game' },
                { status: 404 }
            );
        }

        // sub is gone from the game — any batting stats entered for them
        // under this game are now orphaned (no roster/sub link to justify
        // them counting toward either team), so clean those up too
        await db
            .delete(batting)
            .where(
                and(
                    eq(batting.gameId, gameId),
                    eq(batting.playerId, deleted[0].playerId)
                )
            );

        return NextResponse.json({ success: true, id: subId }, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;
        console.error('DELETE /api/games/[id]/substitutes/[subId] failed:', {
            message: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
        });
        return NextResponse.json(
            { error: 'Failed to remove substitute' },
            { status: 500 }
        );
    }
}
