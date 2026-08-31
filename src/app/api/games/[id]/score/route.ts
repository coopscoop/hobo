import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { games, innings } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

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
        const { innings: inningRows, homeScore, awayScore } = body as {
            innings?: { inning: number; homeRuns: number; awayRuns: number }[];
            homeScore?: number;
            awayScore?: number;
        };

        if (!Array.isArray(inningRows) || inningRows.length === 0 || homeScore == null || awayScore == null) {
            return NextResponse.json({ error: 'innings, homeScore, and awayScore are required' }, { status: 400 });
        }

        const currentMax = Math.max(...inningRows.map((r) => r.inning));

        // if the sheet shrank since a previous save (an extra inning was added,
        // saved, then removed once it had no data), drop any leftover rows past
        // the current max so a stale inning 11 doesn't linger after going back to 9
        await db.delete(innings).where(and(eq(innings.gameId, gameId), gt(innings.inning, currentMax)));

        await Promise.all(
            inningRows.map((row) =>
                db
                    .insert(innings)
                    .values({ gameId, inning: row.inning, homeRuns: row.homeRuns, awayRuns: row.awayRuns })
                    .onConflictDoUpdate({
                        target: [innings.gameId, innings.inning],
                        set: { homeRuns: row.homeRuns, awayRuns: row.awayRuns },
                    })
            )
        );

        const [updatedGame] = await db
            .update(games)
            .set({ homeScore, awayScore })
            .where(eq(games.id, gameId))
            .returning();

        return NextResponse.json(updatedGame, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;
        console.error('POST /api/games/[id]/score failed:', {
            message: pgErr?.message,
            code: pgErr?.code,
        });
        return NextResponse.json({ error: 'Failed to save game score' }, { status: 500 });
    }
}
