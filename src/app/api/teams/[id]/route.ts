import { getTeamById } from '@/db/queries/teams';
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
