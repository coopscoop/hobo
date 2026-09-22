import { PlayersPageClient } from '@/components/players/PlayersPageClient';
import { fetchPlayersWithStats } from '@/lib/services/players';
import { fetchTeams } from '@/lib/services/teams';
import { loadPlayerFilters } from '@/lib/searchParams/players';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SearchParams } from 'nuqs/server';
import { fetchGameYearRange } from '@/lib/services/games';

interface PlayersPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
    const filters = await loadPlayerFilters(searchParams);

    const [players, teams, yearRange] = await Promise.all([
        fetchPlayersWithStats(filters),
        fetchTeams(),
        fetchGameYearRange(),
    ]);

    return (
        <div>
            <Box sx={{ px: 4, py: 3, mb: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Players</Typography>
            </Box>
            <PlayersPageClient players={players} teams={teams} minYear={yearRange.minYear} maxYear={yearRange.maxYear} />
        </div>
    );
}
