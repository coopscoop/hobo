import { getPageContentByName } from '@/lib/db/queries/pageContent';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;

    try {
        const content = await getPageContentByName(name);

        if (!content) {
            return NextResponse.json({ message: 'No page found' }, { status: 404 });
        }

        return NextResponse.json(content, { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error while retrieving content.' },
            { status: 500 }
        );
    }
}
