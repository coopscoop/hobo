import TeamsPageClient from '@/components/teams/TeamsPageClient';
import { fetchTeams } from '@/lib/services/teams';
import { fetchGameYearRange } from '@/lib/services/games';
import { loadTeamFilters } from '@/lib/searchParams/teams';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SearchParams } from 'nuqs/server';

interface TeamsPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
    const filters = await loadTeamFilters(searchParams);

    const [teams, yearRange] = await Promise.all([
        fetchTeams(null, filters),
        fetchGameYearRange(),
    ]);

    return (
        <div>
            <Box sx={{ px: 4, py: 3, mb: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Teams</Typography>
            </Box>
            <TeamsPageClient teams={teams} minYear={yearRange.minYear} maxYear={yearRange.maxYear} />
        </div>
    );
}
