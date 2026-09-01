// lib/db/queries/announcements.ts
import 'server-only';
import { db } from '@/lib/db';
import { announcements } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { NewAnnouncement } from '@/lib/types';

export async function getAnnouncements(options?: { pinned?: boolean; type?: string }) {
  const conditions = [];
  if (options?.pinned !== undefined) conditions.push(eq(announcements.pinned, options.pinned));
  if (options?.type) conditions.push(eq(announcements.type, options.type as any));

  return db
    .select()
    .from(announcements)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(announcements.pinned), desc(announcements.date));
}

export async function getAnnouncementById(id: number) {
  const [result] = await db.select().from(announcements).where(eq(announcements.id, id));
  return result;
}

export async function createAnnouncement(data: NewAnnouncement) {
  return db.insert(announcements).values(data).returning();
}

export async function updateAnnouncement(id: number, data: Partial<NewAnnouncement>) {
  return db.update(announcements).set(data).where(eq(announcements.id, id)).returning();
}

export async function deleteAnnouncement(id: number) {
  return db.delete(announcements).where(eq(announcements.id, id)).returning();
}
