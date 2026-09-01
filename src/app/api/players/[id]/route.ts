// app/api/players/[id]/route.ts
import { updatePlayer, deletePlayer, getPlayerById } from '@/lib/db/queries/players';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const playerId = Number(id);

        if (!playerId || Number.isNaN(playerId)) {
            return NextResponse.json({ error: 'Invalid player id' }, { status: 400 });
        }

        const player = await getPlayerById(playerId);

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json(player, { status: 200 });
    } catch (error) {
        console.error('GET /api/players/[id] failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH and DELETE stay exactly as they are — just add GET above them in the same file

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const playerId = Number(id);

        if (!playerId || Number.isNaN(playerId)) {
            return NextResponse.json({ error: 'Invalid player id' }, { status: 400 });
        }

        const body = await request.json();
        console.log("PATCH /api/players body:", body);
        const { firstName, lastName, currentTeam } = body;

        const [updated] = await updatePlayer(playerId, {
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
            ...(currentTeam !== undefined && { currentTeam }),
        });

        if (!updated) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('PATCH /api/players/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to update player',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const playerId = Number(id);

        if (!playerId || Number.isNaN(playerId)) {
            return NextResponse.json({ error: 'Invalid player id' }, { status: 400 });
        }

        const [deleted] = await deletePlayer(playerId);

        if (!deleted) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id: playerId }, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('DELETE /api/players/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to delete player',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}
