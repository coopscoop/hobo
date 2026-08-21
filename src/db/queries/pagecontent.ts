import { db } from '@/db';
import { pageContent } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getPageContent() {
    return db
        .select()
        .from(pageContent)
        .orderBy(desc(pageContent.id));
}

export async function getPageContentById(idString: string) {
    const id = parseInt(idString, 10);

    if (isNaN(id)) {
        throw new Error('Invalid resource ID format.');
    }

    const results = await db
        .select()
        .from(pageContent)
        .where(eq(pageContent.id, id));

    return results[0] ?? null;
}

export async function getPageContentByName(pageName: string) {
    const results = await db
        .select()
        .from(pageContent)
        .where(eq(pageContent.page_name, pageName));

    return results[0] ?? null;
}

export async function createPageContent(pageName: string, content: string) {
    return db
        .insert(pageContent)
        .values({ page_name: pageName, content: content })
        .returning();
}
