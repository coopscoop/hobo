import { getAnnouncementById } from '@/db/queries/announcements'; import { NextResponse } from 'next/server';

export async function GET(params: { id: string }) {
  const announcementId = params.id;
  
  if (!announcementId) {
    return NextResponse.json({ error: 'Announcement ID is missing' }, { status: 400 });
  }

  try {
    // We assume getAnnouncementById handles a string ID correctly. 
    // If your DB query *requires* a number, you must add conversion and validation here.
    // Example if expecting a number:
    // const numericId = parseInt(announcementId, 10);
    // if (isNaN(numericId)) {
    //     return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    // }
    // const data = await getAnnouncementById(numericId); 
    
    const data = await getAnnouncementById(parseInt(announcementId)); 
    
    if (!data) {
      return NextResponse.json({ error: `Announcement with ID ${announcementId} not found` }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    // Ensure error is logged correctly for debugging
    return NextResponse.json({ error: 'Failed to fetch announcement due to an internal error.' }, { status: 500 });
  }
}
