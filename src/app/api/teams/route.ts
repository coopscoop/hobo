import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams } from '@/lib/db/schema';

export async function GET() {
    try {
        const allTeams = await db.select().from(teams);
        return NextResponse.json(allTeams, { status: 200 });
    } catch (error) {
        console.error('GET /api/teams failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams' },
            { status: 500 }
        );
    }
}
