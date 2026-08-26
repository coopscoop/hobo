import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { substitutes, players } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const gameId = Number(id);
        if (!gameId || Number.isNaN(gameId)) {
            return NextResponse.json({ error: 'Invalid game id' }, { status: 400 });
        }

        const subs = await db
            .select()
            .from(substitutes)
            .where(eq(substitutes.gameId, gameId));

        return NextResponse.json(subs, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;
        console.error('GET /api/games/[id]/substitutes failed:', {
            message: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
        });
        return NextResponse.json(
            { error: 'Failed to fetch substitutes' },
            { status: 500 }
        );
    }
}

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
        const { playerId, newTeamId } = body as {
            playerId?: number;
            newTeamId?: number;
        };

        if (!playerId || !newTeamId) {
            return NextResponse.json(
                { error: 'playerId and newTeamId are required' },
                { status: 400 }
            );
        }

        // derive fromTeamId directly from the player's current team.
        // rosters is historical (who's played for who over time), not
        // "who are they on right now" — players.teamId is the source of
        // truth for a player's current team. Players with no current team
        // (out-of-league standins/travel-ball players added directly to
        // the Players table) are allowed — they just get a null fromTeamId
        const [player] = await db
            .select({ teamId: players.currentTeam })
            .from(players)
            .where(eq(players.id, playerId))
            .limit(1);

        if (!player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 400 }
            );
        }

        const fromTeamId = player.teamId ?? null;

        // a player can't sub onto the team they're already rostered on
        if (fromTeamId !== null && fromTeamId === newTeamId) {
            return NextResponse.json(
                { error: 'Player is already on that team' },
                { status: 400 }
            );
        }

        // prevent adding the same player as a sub for the same game+team twice
        const [existingSub] = await db
            .select({ id: substitutes.id })
            .from(substitutes)
            .where(
                and(
                    eq(substitutes.gameId, gameId),
                    eq(substitutes.playerId, playerId),
                    eq(substitutes.newTeamId, newTeamId)
                )
            )
            .limit(1);

        if (existingSub) {
            return NextResponse.json(
                { error: 'Player is already added as a substitute for this game/team' },
                { status: 409 }
            );
        }

        const [newSub] = await db
            .insert(substitutes)
            .values({
                gameId,
                playerId,
                fromTeamId,
                newTeamId,
            })
            .returning();

        return NextResponse.json(newSub, { status: 201 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;
        console.error('POST /api/games/[id]/substitutes failed:', {
            message: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });
        return NextResponse.json(
            {
                error: 'Failed to add substitute',
                ...(process.env.NODE_ENV !== 'production' && {
                    detail: pgErr?.detail ?? pgErr?.message,
                }),
            },
            { status: 500 }
        );
    }
}
