import { GamesPageClient } from '@/components/games/GamesPageClient';
import { CreateGameButton } from '@/components/games/CreateGameButton';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

export default async function GamesPage() {
    const [games, yearRange] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/yearrange`).then((r) => r.json()),
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
