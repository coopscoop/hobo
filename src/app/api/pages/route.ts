import { getPages } from '@/lib/db/queries/pages';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const content = await getPages();
        return NextResponse.json(content, { status: 200 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: 'Internal server error while retrieving content.' },
            { status: 500 }
        );
    }
}
