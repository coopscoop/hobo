import { getGames } from '@/db/queries/games';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games } from '@/db/schema';

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

type CreateGameBody = {
    location: string;
    fieldId: 1;
    homeTeamId: number;
    awayTeamId: number;
    leagueId: 2;
    isPlayoff: false;
    notes: string;
    homeScore: 0;
    awayScore: 0;
    date: string; // e.g. "2026-08-25" -- defaults to now
    time?: string; // e.g. "13:30:00" — defaults to 09:00:00 if omitted
};

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as Partial<CreateGameBody>;
        const { homeTeamId, awayTeamId, fieldId, date, time } = body;

        // basic required-field validation
        if (!homeTeamId || !awayTeamId || !fieldId || !date) {
            return NextResponse.json(
                { error: 'homeTeamId, awayTeamId, fieldId, and date are required' },
                { status: 400 }
            );
        }

        // teams can't play themselves
        if (homeTeamId === awayTeamId) {
            return NextResponse.json(
                { error: 'homeTeamId and awayTeamId must be different' },
                { status: 400 }
            );
        }

        const [newGame] = await db
            .insert(games)
            .values({
                homeTeamId,
                awayTeamId,
                date,
                // hardcoded until real support exists
                leagueId: 2,
                location: 'DEPRECIATED',
                notes: '',
                homeScore: 0,
                awayScore: 0,
                isPlayoff: false,
                time: time ?? '09:00:00',
                fieldId,
            })
            .returning();

        return NextResponse.json(newGame, { status: 201 });
    } catch (error) {
        // log everything we can get out of the error — pg/drizzle errors often
        // carry the real detail in .cause or driver-specific fields (code, detail,
        // constraint) rather than in .message itself
        // Drizzle wraps the real pg error inside `.cause` — the top-level error
        // is usually just "Failed query: ..." with no useful detail of its own.
        // Walk the cause chain to find the actual pg driver error.
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('POST /api/games failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code, // Postgres error code, e.g. 23505 unique_violation, 23503 fk_violation, 23502 not_null_violation
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
            table: pgErr?.table,
            column: pgErr?.column,
            stack: err?.stack,
        });

        return NextResponse.json(
            {
                error: 'Failed to create game',
                // only leak details outside prod — don't ship raw db errors to clients in production
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message ?? String(error),
                    constraint: pgErr?.constraint,
                }),
            },
            { status: 500 }
        );
    }
}

