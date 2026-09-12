import type { StandingType } from '@/lib/types';

function baseUrl() {
    if (typeof window !== 'undefined') return ''
    return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchStandings({
    leagueId,
    type = 'all',
    year = 2026,
}: {
    leagueId?: string;
    type?: StandingType;
    year?: number;
} = {}) {
    const params = new URLSearchParams();

    if (leagueId) {
        params.append('leagueId', leagueId);
    }

    params.append('type', type);
    params.append('year', String(year));

    const url = `${baseUrl()}/api/standings?${params.toString()}`;

    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error('Failed to fetch standings');
    }

    return res.json();
}
