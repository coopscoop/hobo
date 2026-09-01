import { PlayersPageClient } from '@/components/players/PlayersPageClient';
import { fetchPlayersWithStats } from '@/lib/services/players';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PlayersPageProps {
    searchParams: Promise<{
        yearFrom?: string;
        yearTo?: string;
    }>;
}

export default async function PlayersPage({
    searchParams,
}: PlayersPageProps) {
    const { yearFrom, yearTo } = await searchParams;

    const parsedYearFrom = yearFrom
        ? Number(yearFrom)
        : undefined;

    const parsedYearTo = yearTo
        ? Number(yearTo)
        : undefined;

    const players = await fetchPlayersWithStats(
        parsedYearFrom,
        parsedYearTo,
    );

    return (
        <div>
            <Box sx={{ px: 4, py: 3, mb: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Players</Typography>
            </Box>
            <PlayersPageClient
                players={players}
                yearFrom={yearFrom ?? ''}
                yearTo={yearTo ?? ''}
            />
        </div>
    );
}
