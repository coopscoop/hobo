import { db } from '@/lib/db';
import { executives } from '@/lib/db/schema';
import { not, eq } from 'drizzle-orm';

export async function getExecutives() {
  return db
    .select()
    .from(executives)
    .orderBy(executives.lastName);
}

export async function getCurrentExecutives() {
  return db
    .select()
    .from(executives)
    .where(eq(executives.year, new Date().getFullYear()))
    .orderBy(executives.lastName);
}

export async function getPreviousExecutives() {
  return db
    .select()
    .from(executives)
    .where(not(eq(executives.year, new Date().getFullYear())))
    .orderBy(executives.lastName);
}
