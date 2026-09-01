import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { executives } from '@/lib/db/schema';

export async function GET() {
    try {
        const allFields = await db.select().from(executives);
        return NextResponse.json(allFields, { status: 200 });
    } catch (error) {
        console.error('GET /api/executives failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fields' },
            { status: 500 }
        );
    }
}
