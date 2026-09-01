import type {
    PlayerGameLog,
} from '@/types';

function baseUrl() {
    if (typeof window !== 'undefined') return '';

    return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000';
}

export async function fetchPlayersWithStats(
    yearFrom?: number | null,
    yearTo?: number | null,
) {
    const params = new URLSearchParams();

    if (yearFrom != null) {
        params.set('yearFrom', String(yearFrom));
    }

    if (yearTo != null) {
        params.set('yearTo', String(yearTo));
    }

    const query = params.toString();

    const res = await fetch(
        `${baseUrl()}/api/players/stats${query ? `?${query}` : ''}`,
        { cache: 'no-store' },
    );

    if (!res.ok) {
        throw new Error('Failed to fetch player stats');
    }

    return res.json();
}

export async function fetchPlayerById(playerId: number) {
    const res = await fetch(
        `${baseUrl()}/api/players/${playerId}`,
        { cache: 'no-store' },
    );

    if (!res.ok) {
        throw new Error('Failed to fetch player');
    }

    return res.json();
}

export async function fetchPlayerStatsById(playerId: number) {
    const res = await fetch(
        `${baseUrl()}/api/players/${playerId}/stats`,
        { cache: 'no-store' },
    );

    if (!res.ok) {
        throw new Error('Failed to fetch player stats');
    }

    return res.json();
}

export async function fetchPlayerGameLog(
    playerId: number,
    year?: number,
): Promise<PlayerGameLog> {
    const params = new URLSearchParams();

    if (year !== undefined) {
        params.set('year', String(year));
    }

    const query = params.toString();

    const res = await fetch(
        `${baseUrl()}/api/players/${playerId}/games${query ? `?${query}` : ''}`,
        { cache: 'no-store' },
    );

    if (!res.ok) {
        throw new Error('Failed to fetch player game log');
    }

    return res.json();
}

export async function fetchPlayers(): Promise<any[]> {
    const res = await fetch(`${baseUrl()}/api/players`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch players')
    return res.json()
}

export async function createPlayer(data: {
    firstName: string
    lastName: string
    currentTeam: number | null
}) {
    const res = await fetch(`${baseUrl()}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create player')
    }
    return res.json()
}

export async function updatePlayer(id: number, data: Partial<{
    firstName: string
    lastName: string
    currentTeam: number | null
}>) {
    const res = await fetch(`${baseUrl()}/api/players/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to update player')
    }
    return res.json()
}

export async function deletePlayer(id: number) {
    const res = await fetch(`${baseUrl()}/api/players/${id}`, { method: 'DELETE' })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to delete player')
    }
    return res.json()
}
