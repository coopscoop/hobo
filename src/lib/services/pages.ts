// lib/services/pages.ts
function baseUrl() {
    if (typeof window !== 'undefined') return ''
    return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchPages(): Promise<{ id: number; pageName: string; content: string }[]> {
    const res = await fetch(`${baseUrl()}/api/pages`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch pages')
    return res.json()
}

export async function fetchPageByName(pageName: string) {
    const res = await fetch(`${baseUrl()}/api/pages/name/${pageName}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch page content')
    return res.json()
}

export async function updatePageContent(id: number, content: string) {
    const res = await fetch(`${baseUrl()}/api/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    })
    if (!res.ok) throw new Error('Failed to save page content')
    return res.json()
}
