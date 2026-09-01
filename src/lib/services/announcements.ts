function baseUrl() {
  if (typeof window !== 'undefined') return ''
  return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchAnnouncements(options?: { pinned?: boolean; type?: string }) {
  const params = new URLSearchParams()
  if (options?.pinned !== undefined) params.append('pinned', String(options.pinned))
  if (options?.type) params.append('type', options.type)
  
  const url = `${baseUrl()}/api/announcements${params.toString() ? '?' + params.toString() : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch announcements')
  return res.json()
}

export async function fetchAnnouncementById(id: number) {
  const res = await fetch(`${baseUrl()}/api/announcements/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch announcement')
  return res.json()
}

export async function createAnnouncement(data: any) {
  const res = await fetch(`${baseUrl()}/api/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create announcement')
  return res.json()
}

export async function updateAnnouncement(id: number, data: any) {
  const res = await fetch(`${baseUrl()}/api/announcements/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update announcement')
  return res.json()
}

export async function deleteAnnouncement(id: number) {
  const res = await fetch(`${baseUrl()}/api/announcements/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete announcement')
}
