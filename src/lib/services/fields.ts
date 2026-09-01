// lib/services/fields.ts
function baseUrl() {
    if (typeof window !== 'undefined') return ''
    return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchFields(): Promise<{ id: number; name: string }[]> {
    const res = await fetch(`${baseUrl()}/api/fields`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch fields')
    return res.json()
}
