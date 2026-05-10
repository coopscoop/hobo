import { db } from '@/db';
import { announcements } from '@/db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

export async function getAnnouncements() {
  return db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.date));
}

export async function getAnnouncementById(id: number) {
  const [announcement] = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, id));

  return announcement ?? null;
}

export async function getPinnedAnnouncements() {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.pinned, true))
    .orderBy(desc(announcements.date));
}

export async function getSeasonAnnouncements() {
  return db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.pinned, false),
        // gte(announcements.date, sql`date_trunc('year', current_date)`)
      )
    )
    .orderBy(desc(announcements.date))
    .limit(5);
}
