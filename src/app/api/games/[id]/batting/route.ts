import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { batting } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { computeBattingRow } from '@/types/constants';
import type { InningMap } from '@/types/types';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const gameId = Number(id);
        if (!gameId || Number.isNaN(gameId)) {
            return NextResponse.json({ error: 'Invalid game id' }, { status: 400 });
        }

        const body = await request.json();
        const { playerId, innings } = body as {
            playerId?: number;
            innings?: InningMap;
        };

        if (!playerId || Number.isNaN(Number(playerId))) {
            return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
        }
        if (!innings || typeof innings !== 'object') {
            return NextResponse.json({ error: 'innings data is required' }, { status: 400 });
        }

        // perInning is the raw source of truth; every counting column is
        // derived from it server-side rather than trusted from the client,
        // so a stray client-side bug can't silently write inconsistent totals
        const row = computeBattingRow(innings);

        const [saved] = await db
            .insert(batting)
            .values({
                gameId,
                playerId,
                atBat: row.atBat,
                run: row.run,
                walk: row.walk,
                strikeout: row.strikeout,
                hitByPitch: row.hitByPitch,
                stolenBase: row.stolenBase,
                runsBattedIn: row.runsBattedIn,
                sacrifice: row.sacrifice,
                singleHit: row.singleHit,
                doubleHit: row.doubleHit,
                tripleHit: row.tripleHit,
                homeRun: row.homeRun,
                perInning: innings,
            })
            .onConflictDoUpdate({
                target: [batting.gameId, batting.playerId],
                set: {
                    atBat: row.atBat,
                    run: row.run,
                    walk: row.walk,
                    strikeout: row.strikeout,
                    hitByPitch: row.hitByPitch,
                    stolenBase: row.stolenBase,
                    runsBattedIn: row.runsBattedIn,
                    sacrifice: row.sacrifice,
                    singleHit: row.singleHit,
                    doubleHit: row.doubleHit,
                    tripleHit: row.tripleHit,
                    homeRun: row.homeRun,
                    perInning: innings,
                },
            })
            .returning();

        return NextResponse.json(saved, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;
        console.error('POST /api/games/[id]/batting failed:', {
            message: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
        });
        return NextResponse.json(
            { error: 'Failed to save batting data' },
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
        const { searchParams } = new URL(request.url);
        const playerId = Number(searchParams.get('playerId'));

        if (!gameId || !playerId || Number.isNaN(gameId) || Number.isNaN(playerId)) {
            return NextResponse.json({ error: 'Invalid game id or player id' }, { status: 400 });
        }

        // used when a substitute is removed from the game entirely — their
        // batting row (if any stats were entered) should go with them
        const deleted = await db
            .delete(batting)
            .where(and(eq(batting.gameId, gameId), eq(batting.playerId, playerId)))
            .returning();

        return NextResponse.json({ success: true, deleted: deleted.length }, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;
        console.error('DELETE /api/games/[id]/batting failed:', {
            message: pgErr?.message,
            code: pgErr?.code,
        });
        return NextResponse.json({ error: 'Failed to delete batting row' }, { status: 500 });
    }
}
