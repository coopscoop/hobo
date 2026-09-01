// app/api/announcements/[id]/route.ts
import { getAnnouncementById, updateAnnouncement, deleteAnnouncement } from '@/lib/db/queries/announcements';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const announcementId = Number(id);
        if (!announcementId || Number.isNaN(announcementId)) {
            return NextResponse.json({ error: 'Invalid announcement id' }, { status: 400 });
        }

        const announcement = await getAnnouncementById(announcementId);
        if (!announcement) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }
        return NextResponse.json(announcement, { status: 200 });
    } catch (error) {
        console.error('GET /api/announcements/[id] failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const announcementId = Number(id);
        if (!announcementId || Number.isNaN(announcementId)) {
            return NextResponse.json({ error: 'Invalid announcement id' }, { status: 400 });
        }

        const body = await request.json();
        const { title, content, type, pinned } = body;

        const [updated] = await updateAnnouncement(announcementId, {
            ...(title !== undefined && { title }),
            ...(content !== undefined && { content }),
            ...(type !== undefined && { type }),
            ...(pinned !== undefined && { pinned }),
        });

        if (!updated) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('PATCH /api/announcements/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to update announcement',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const announcementId = Number(id);
        if (!announcementId || Number.isNaN(announcementId)) {
            return NextResponse.json({ error: 'Invalid announcement id' }, { status: 400 });
        }

        const [deleted] = await deleteAnnouncement(announcementId);
        if (!deleted) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id: announcementId }, { status: 200 });
    } catch (error) {
        const err = error as any;
        const pgErr = err?.cause ?? err;

        console.error('DELETE /api/announcements/[id] failed:', {
            message: err?.message,
            pgMessage: pgErr?.message,
            code: pgErr?.code,
            detail: pgErr?.detail,
            constraint: pgErr?.constraint,
        });

        return NextResponse.json(
            {
                error: 'Failed to delete announcement',
                ...(process.env.NODE_ENV !== 'production' && {
                    code: pgErr?.code,
                    detail: pgErr?.detail ?? pgErr?.message ?? err?.message,
                }),
            },
            { status: 500 }
        );
    }
}
