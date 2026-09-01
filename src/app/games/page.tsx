// app/games/page.tsx
import { GamesPageClient } from '@/components/games/GamesPageClient';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { fetchGamesList, fetchGameYearRange } from '@/lib/services/games';

export default async function GamesPage() {
    const [games, yearRange] = await Promise.all([
        fetchGamesList(),
        fetchGameYearRange(),
    ]);

    return (
        <div>
            <Box sx={{ px: 4, py: 3, mb: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Games & Results</Typography>
            </Box>
            <GamesPageClient
                initialGames={games}
                minYear={yearRange.minYear}
                maxYear={yearRange.maxYear}
            />
        </div>
    );
}
