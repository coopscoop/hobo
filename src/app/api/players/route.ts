// app/api/players/route.ts
import { getPlayerNames, createPlayer } from '@/lib/db/queries/players';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const players = await getPlayerNames();
        return NextResponse.json(players, { status: 200 });
    } catch (error) {
        console.error('GET /api/players failed:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, currentTeam } = body;

        if (!firstName || !lastName) {
            return NextResponse.json(
                { error: 'firstName and lastName are required' },
                { status: 400 }
            );
        }

        const [newPlayer] = await createPlayer({
            firstName,
            lastName,
            currentTeam: currentTeam ?? null,
        });

        return NextResponse.json(newPlayer, { status: 201 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('POST /api/players failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to create player',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}
