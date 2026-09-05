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

    const url = `${baseUrl()}/api/games/`
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

export async function fetchGamesList(): Promise<any[]> {
    const res = await fetch(`${baseUrl()}/api/games`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch games')
    return res.json()
}

export async function createGame(data: {
    homeTeamId: number
    awayTeamId: number
    fieldId: number
    date: string
    time?: string
}) {
    const res = await fetch(`${baseUrl()}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create game')
    }
    return res.json()
}

export async function deleteGame(id: number) {
    const res = await fetch(`${baseUrl()}/api/games/${id}`, { method: 'DELETE' })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to delete game')
    }
    return res.json()
}

export async function saveBattingRow(gameId: string, playerId: number, innings: any) {
    const res = await fetch(`${baseUrl()}/api/games/${gameId}/batting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, innings }),
    });
    if (!res.ok) throw new Error(`Failed to save batting row: ${res.status}`);
    return res.json();
}

export async function saveGameScore(gameId: string, innings: any, homeScore: number, awayScore: number) {
    const res = await fetch(`${baseUrl()}/api/games/${gameId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ innings, homeScore, awayScore }),
    });
    if (!res.ok) throw new Error(`Failed to save game score: ${res.status}`);
    return res.json();
}

export async function addSubstitute(gameId: string, playerId: number, newTeamId: number) {
    const res = await fetch(`${baseUrl()}/api/games/${gameId}/substitutes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, newTeamId }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add substitute");
    }
    return res.json();
}

export async function removeSubstitute(gameId: string, subId: number) {
    const res = await fetch(`${baseUrl()}/api/games/${gameId}/substitutes/${subId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to remove substitute: ${res.status}`);
    return res.json();
}

export async function fetchGameById(id: string) {
    const res = await fetch(`${baseUrl()}/api/games/${id}`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Failed to fetch game: ${res.status}`)
    return res.json()
}
