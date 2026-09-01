// app/api/announcements/route.ts
import { getAnnouncements, createAnnouncement } from '@/lib/db/queries/announcements';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;
        const pinnedParam = p.get('pinned');
        const announcements = await getAnnouncements({
            pinned: pinnedParam === null ? undefined : pinnedParam === 'true',
            type: p.get('type') ?? undefined,
        });
        return NextResponse.json(announcements, { status: 200 });
    } catch (error) {
        console.error('GET /api/announcements failed:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, type, pinned } = body;

        if (!title) {
            return NextResponse.json({ error: 'title is required' }, { status: 400 });
        }

        const [newAnnouncement] = await createAnnouncement({
            title,
            content: content ?? '',
            ...(type && { type }),
            ...(pinned !== undefined && { pinned }),
        });

        return NextResponse.json(newAnnouncement, { status: 201 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('POST /api/announcements failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to create announcement',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}
