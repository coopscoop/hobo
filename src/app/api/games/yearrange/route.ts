import { getGameYearRange } from '@/lib/db/queries/games';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const yearRange = await getGameYearRange();

        return NextResponse.json(yearRange);
    } catch (error) {
        console.error('Failed to fetch game year range:', error);

        return NextResponse.json(
            { message: 'Failed to fetch game year range' },
            { status: 500 },
        );
    }
}
