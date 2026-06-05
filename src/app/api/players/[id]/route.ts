import { getPlayerById, getPlayerGameLog } from '@/db/queries/players';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    try {
        if (year) {
            const gameLog = await getPlayerGameLog(id, year);
            return NextResponse.json(gameLog);
        }

        const data = await getPlayerById(id);
        if (!data) return NextResponse.json({ error: 'Player not found.' }, { status: 404 });

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
