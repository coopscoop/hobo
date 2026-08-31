import 'server-only'
import { db } from '@/lib/db'
import { executives } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { NewExecutive } from '@/lib/types'

export async function getExecutives() {
  return db.select().from(executives).orderBy(desc(executives.year), executives.lastName)
}

export async function getExecutiveById(id: number) {
  const [result] = await db.select().from(executives).where(eq(executives.id, id))
  return result
}

export async function createExecutive(data: NewExecutive) {
  return db.insert(executives).values(data).returning()
}

export async function updateExecutive(id: number, data: Partial<NewExecutive>) {
  return db.update(executives).set(data).where(eq(executives.id, id)).returning()
}

export async function deleteExecutive(id: number) {
  return db.delete(executives).where(eq(executives.id, id))
}
