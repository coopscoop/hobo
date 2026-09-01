import { getTeamById, updateTeam, deleteTeam, teamHasGames } from '@/lib/db/queries/teams';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const data = await getTeamById(id);
        if (!data) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid resource ID format.') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error instanceof Error && error.message === 'Invalid year format.') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const teamId = Number(id);

        if (!teamId || Number.isNaN(teamId)) {
            return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });
        }

        const body = await request.json();
        const { teamName } = body;

        if (!teamName || typeof teamName !== 'string') {
            return NextResponse.json(
                { error: 'teamName is required and must be a string' },
                { status: 400 }
            );
        }

        const [updated] = await updateTeam(teamId, teamName);

        if (!updated) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('PATCH /api/teams/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to update team',
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
        const teamId = Number(id);

        if (!teamId || Number.isNaN(teamId)) {
            return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });
        }

        const hasGames = await teamHasGames(teamId);
        if (hasGames) {
            return NextResponse.json(
                { error: 'This team has games on record and cannot be deleted.' },
                { status: 409 }
            );
        }

        const [deleted] = await deleteTeam(teamId);

        if (!deleted) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id: teamId }, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        // A 23503 here almost certainly means players/rosters still reference
        // this team (currentTeam / rosters.teamId) even though it has no games —
        // give a clearer message than the raw constraint name.
        const isFkViolation = pgErr?.code === '23503';

        console.error('DELETE /api/teams/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: isFkViolation
                    ? 'This team still has players assigned to it and cannot be deleted.'
                    : 'Failed to delete team',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}
