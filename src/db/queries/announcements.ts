import { db } from '@/db';
import { announcements } from '@/db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

export async function getAnnouncements() {
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

    return results[0] ?? null; // return single record or null
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
        .limit(5);
}
