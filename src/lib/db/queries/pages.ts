import 'server-only'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NewPage } from '@/lib/types'

export async function getPages() {
  return db.select().from(pages).orderBy(pages.pageName)
}

export async function getPageByName(pageName: string) {
  const [result] = await db.select().from(pages).where(eq(pages.pageName, pageName))
  return result
}

export async function createPage(data: NewPage) {
  return db.insert(pages).values(data).returning()
}

export async function updatePage(pageName: string, data: Partial<NewPage>) {
  return db.update(pages).set(data).where(eq(pages.pageName, pageName)).returning()
}

export async function deletePage(pageName: string) {
  return db.delete(pages).where(eq(pages.pageName, pageName))
}
