import { getPlayerNames } from '@/lib/db/queries/players';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const players = await getPlayerNames();
        return NextResponse.json(players, { status: 200 });
    } catch (error) {
        console.error('GET /api/players failed:', error);
        return NextResponse.json([], { status: 500 });
    }
}
