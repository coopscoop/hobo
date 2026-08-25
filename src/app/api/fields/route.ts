import { NextResponse } from 'next/server';
import { db } from '@/db';
import { fields } from '@/db/schema';

export async function GET() {
    try {
        const allFields = await db.select().from(fields);
        return NextResponse.json(allFields, { status: 200 });
    } catch (error) {
        console.error('GET /api/fields failed:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fields' },
            { status: 500 }
        );
    }
}
