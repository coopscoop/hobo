function baseUrl() {
  if (typeof window !== 'undefined') return ''
  return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchStandings(leagueId?: string) {
  const params = new URLSearchParams()
  if (leagueId) params.append('leagueId', leagueId);
  
  const url = `${baseUrl()}/api/standings${params.toString() ? '?' + params.toString() : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch standings')
  return res.json()
}
