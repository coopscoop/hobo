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
