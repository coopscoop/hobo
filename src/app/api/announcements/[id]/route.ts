import { getAnnouncementById } from '@/lib/db/queries/announcements';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const resourceData = await getAnnouncementById(id);

        if (!resourceData) {
            return new Response(JSON.stringify({ message: "Resource not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        return Response.json(resourceData, { status: 200 });
    } catch (error) {
        // Check if the error is the specific format error we are looking for
        if (error instanceof Error && error.message === 'Invalid resource ID format.') {
            return NextResponse.json(
                { error: 'Invalid resource ID format.' },
                { status: 400 }
            );
        }

        // Handle other internal errors (e.g., database connection failure)
        console.error("API Error:", error);
        return NextResponse.json(
            { error: 'Internal server error while retrieving announcement.' },
            { status: 500 }
        );
    }
}
