import type { TeamWithPlayers } from '@/lib/types'
import type { getTeamById } from '@/lib/db/queries/teams';
import { serializeTeamFilters } from '../searchParams/teams';

function baseUrl() {
    if (typeof window !== 'undefined') return ''
    return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchTeams(leagueId?: string | null, filters: TeamFilters = {}): Promise<TeamWithPlayers[]> {
    const params = new URLSearchParams()
    if (leagueId && leagueId !== 'all') params.append('leagueId', leagueId)

    let url = `${baseUrl()}/api/teams${params.toString() ? '?' + params.toString() : ''}`
    url = serializeTeamFilters(url, filters)

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch teams')
    return res.json()
}

export async function fetchTeamById(
    id: number,
): Promise<Awaited<ReturnType<typeof getTeamById>>> {
    const url = `${baseUrl()}/api/teams/${id}`;

    const res = await fetch(url, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch team');
    }

    return res.json();
}

export async function createTeam(teamName: string) {
    const res = await fetch(`${baseUrl()}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to create team')
    }
    return res.json()
}

export async function updateTeam(id: number, teamName: string) {
    const res = await fetch(`${baseUrl()}/api/teams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName }),
    })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to update team')
    }
    return res.json()
}

export async function deleteTeam(id: number) {
    const res = await fetch(`${baseUrl()}/api/teams/${id}`, { method: 'DELETE' })
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to delete team')
    }
    return res.json()
}
