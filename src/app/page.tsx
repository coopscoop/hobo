import { getUpcomingGames, getRecentGames } from '@/db/queries/games';
import { getPinnedAnnouncements, getSeasonAnnouncements } from '@/db/queries/announcements';
import { UpcomingGamesTable } from '@/components/home/UpcomingGamesTable';
import { RecentGamesTable } from '@/components/home/RecentGamesTable';
import { Box, Typography, Stack } from '@mui/material';
import { NewsList } from '@/components/home/NewsList';

export default async function HomePage() {
  const [upcomingGames, recentGames, pinnedNews, seasonNews] = await Promise.all([
    getUpcomingGames(),
    getRecentGames(),
    getPinnedAnnouncements(),
    getSeasonAnnouncements(),
  ]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Hamilton Oldtimers Baseball
      </Typography>

      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
        {/* Left column — 2/3 width */}
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <UpcomingGamesTable games={upcomingGames} />
          <Box sx={{ mt: 3 }}>
            <RecentGamesTable games={recentGames} />
          </Box>
        </Box>

        {/* Right column — 1/3 width */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <NewsList title="Pinned" announcements={pinnedNews} />
          <Box sx={{ mt: 3 }}>
            <NewsList title="Season News" announcements={seasonNews} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
