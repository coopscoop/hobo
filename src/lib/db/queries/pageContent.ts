import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getPageContent() {
    return db
        .select()
        .from(pages)
        .orderBy(desc(pages.id));
}

export async function getPageContentById(idString: string) {
    const id = parseInt(idString, 10);

    if (isNaN(id)) {
        throw new Error('Invalid resource ID format.');
    }

    const results = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id));

    return results[0] ?? null;
}

export async function getPageContentByName(pageName: string) {
    const results = await db
        .select()
        .from(pages)
        .where(eq(pages.pageName, pageName));

    return results[0] ?? null;
}

export async function updatePageContent(idString: string, content: string) {
    const id = parseInt(idString, 10);

    if (isNaN(id)) {
        throw new Error('Invalid resource ID format.');
    }

    const results = await db
        .update(pages)
        .set({ content })
        .where(eq(pages.id, id))
        .returning();

    return results[0] ?? null;
}
