import { updatePage } from '@/lib/db/queries/pages'
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { content } = body;

        if (typeof content !== 'string') {
            return NextResponse.json(
                { error: 'content is required and must be a string.' },
                { status: 400 }
            );
        }

        const updated = await updatePage(Number(id), { content });

        if (!updated) {
            return NextResponse.json({ error: 'No page found' }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid resource ID format.') {
            return NextResponse.json(
                { error: 'Invalid resource ID format.' },
                { status: 400 }
            );
        }

        console.error("API Error:", error);
        return NextResponse.json(
            { error: 'Internal server error while updating content.' },
            { status: 500 }
        );
    }
}
