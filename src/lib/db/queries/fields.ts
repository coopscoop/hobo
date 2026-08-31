import 'server-only'
import { db } from '@/lib/db'
import { fields } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NewField } from '@/lib/types'

export async function getFields() {
  return db.select().from(fields).orderBy(fields.name)
}

export async function getFieldById(id: number) {
  const [result] = await db.select().from(fields).where(eq(fields.id, id))
  return result
}

export async function createField(data: NewField) {
  return db.insert(fields).values(data).returning()
}

export async function updateField(id: number, data: Partial<NewField>) {
  return db.update(fields).set(data).where(eq(fields.id, id)).returning()
}

export async function deleteField(id: number) {
  return db.delete(fields).where(eq(fields.id, id))
}
