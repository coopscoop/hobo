import type { GameListItem } from '@/lib/types'

function baseUrl() {
    if (typeof window !== 'undefined') return ''
    return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchUpcomingGames(leagueId?: string | null): Promise<GameListItem[]> {
    const params = new URLSearchParams()
    if (leagueId && leagueId !== 'all') params.append('leagueId', leagueId)

    const url = `${baseUrl()}/api/games/upcoming${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch upcoming games')
    return res.json()
}

export async function fetchRecentGames(leagueId?: string | null): Promise<GameListItem[]> {
    const params = new URLSearchParams()
    if (leagueId && leagueId !== 'all') params.append('leagueId', leagueId)

    const url = `${baseUrl()}/api/games/recent${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch recent games')
    return res.json()
}

export async function fetchAllGames(leagueId?: string | null): Promise<GameListItem[]> {
    const params = new URLSearchParams()
    if (leagueId && leagueId !== 'all') params.append('leagueId', leagueId)

    const url = `${baseUrl()}/api/games/all${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch all ')
    return res.json()
}

export async function fetchGameYearRange(): Promise<{
    minYear: number;
    maxYear: number;
}> {
    const res = await fetch(
        `${baseUrl()}/api/games/yearrange`,
        { cache: 'no-store' },
    );

    if (!res.ok) {
        throw new Error('Failed to fetch game year range');
    }

    return res.json();
}

export async function getGameEditData(id: string) {
  const res = await fetch(`/api/games/${id}/edit-data`);
  if (!res.ok) throw new Error(`Failed to load game edit data: ${res.status}`);
  return res.json();
}
