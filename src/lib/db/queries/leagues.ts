import 'server-only'
import { db } from '@/lib/db'
import { leagues } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NewLeague } from '@/lib/types'

export async function getLeagues() {
  return db.select().from(leagues).orderBy(leagues.leagueName)
}

export async function getLeagueById(id: number) {
  const [result] = await db.select().from(leagues).where(eq(leagues.id, id))
  return result
}

export async function createLeague(data: NewLeague) {
  return db.insert(leagues).values(data).returning()
}

export async function updateLeague(id: number, data: Partial<NewLeague>) {
  return db.update(leagues).set(data).where(eq(leagues.id, id)).returning()
}

export async function deleteLeague(id: number) {
  return db.delete(leagues).where(eq(leagues.id, id))
}
