import { db } from '@/db';
import { executives } from '@/db/schema';

export async function getExecutives() {
  return db
    .select()
    .from(executives)
    .orderBy(executives.lastName);
}
