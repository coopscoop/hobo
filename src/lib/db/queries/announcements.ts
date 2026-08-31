import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function getAllAnnouncements() {
    return db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.date));
}

export async function getAnnouncementById(idString: string) {
    const id = parseInt(idString, 10);

    if (isNaN(id)) {
        throw new Error('Invalid resource ID format.');
    }

    const results = await db
        .select()
        .from(announcements)
        .where(eq(announcements.id, id));

    return results[0] ?? null; // return single record or null if it doesn't exist
}

export async function getPinnedAnnouncements() {
    return db
        .select()
        .from(announcements)
        .where(eq(announcements.pinned, true))
        .orderBy(desc(announcements.date));
}

export async function getGeneralAnnouncements() {
    return db
        .select()
        .from(announcements)
        .where(eq(announcements.pinned, false))
        .orderBy(desc(announcements.date))
}

export async function getLastAnnouncements() {
    return db
        .select()
        .from(announcements)
        .orderBy(desc(announcements.date))
        .limit(10);
}

export async function createAnnouncement() {

}  
