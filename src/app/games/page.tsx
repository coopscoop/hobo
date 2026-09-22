import { GamesPageClient } from '@/components/games/GamesPageClient';
import { fetchAllGames, fetchGameYearRange } from '@/lib/services/games';
import { fetchTeams } from '@/lib/services/teams';
import { fetchFields } from '@/lib/services/fields';
import { loadGameFilters } from '@/lib/searchParams/games';
import type { SearchParams } from 'nuqs/server';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

export default async function GamesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const filters = await loadGameFilters(searchParams);

    const [games, yearRange, teams, fields] = await Promise.all([
        fetchAllGames(filters),
        fetchGameYearRange(),
        fetchTeams(),
        fetchFields(),
    ]);

    return (
        <div>
            <Box sx={{ px: 4, py: 3, mb: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Games & Results</Typography>
            </Box>
            <GamesPageClient games={games} minYear={yearRange.minYear} maxYear={yearRange.maxYear} teams={teams} fields={fields} />
        </div>
    );
}
