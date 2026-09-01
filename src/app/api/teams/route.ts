// app/api/teams/route.ts
import { getTeams, createTeam } from '@/lib/db/queries/teams';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const leagueId = req.nextUrl.searchParams.get('leagueId');
        const teams = await getTeams(leagueId);
        return NextResponse.json(teams, { status: 200 });
    } catch (error) {
        console.error('GET /api/teams failed:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { teamName } = body;

        if (!teamName || typeof teamName !== 'string') {
            return NextResponse.json(
                { error: 'teamName is required and must be a string' },
                { status: 400 }
            );
        }

        const [newTeam] = await createTeam(teamName);
        return NextResponse.json(newTeam, { status: 201 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('POST /api/teams failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to create team',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}
