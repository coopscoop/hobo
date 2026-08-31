import type { TeamWithPlayers } from '@/lib/types'
import type { getTeamById } from '@/lib/db/queries/teams';

function baseUrl() {
  if (typeof window !== 'undefined') return ''
  return process.env.INTERNAL_BASE_URL ?? 'http://localhost:3000'
}

export async function fetchTeams(leagueId?: string | null): Promise<TeamWithPlayers[]> {
  const params = new URLSearchParams()
  if (leagueId && leagueId !== 'all') params.append('leagueId', leagueId)

  const url = `${baseUrl()}/api/teams${params.toString() ? '?' + params.toString() : ''}`
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
