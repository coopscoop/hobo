'use client';

import { useEffect, useState } from 'react';
import { useLeague } from '@/context/LeagueContext';
import { UpcomingGamesTable } from '@/components/home/UpcomingGamesTable';
import { RecentGamesTable } from '@/components/home/RecentGamesTable';
import { NewsList } from '@/components/home/NewsList';
import { Box, Typography, Stack } from '@mui/material';
import type { GameListItem } from '@/types';
import type { Announcement } from '@/types';

export default function HomePage() {
  const { leagueId } = useLeague();
  const [upcomingGames, setUpcomingGames] = useState<GameListItem[]>([]);
  const [recentGames, setRecentGames] = useState<GameListItem[]>([]);
  const [pinnedNews, setPinnedNews] = useState<Announcement[]>([]);
  const [seasonNews, setSeasonNews] = useState<Announcement[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (leagueId !== 'all') params.set('leagueId', leagueId);

    Promise.all([
      fetch(`/api/games/upcoming?${params}`).then((r) => r.json()),
      fetch(`/api/games/recent?${params}`).then((r) => r.json()),
      fetch('/api/announcements/pinned').then((r) => r.json()),
      fetch('/api/announcements/season').then((r) => r.json()),
    ]).then(([upcoming, recent, pinned, season]) => {
      setUpcomingGames(upcoming);
      setRecentGames(recent);
      setPinnedNews(pinned);
      setSeasonNews(season);
    });
  }, [leagueId]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Hamilton Oldtimers Baseball
      </Typography>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <UpcomingGamesTable games={upcomingGames} />
          <Box sx={{ mt: 3 }}>
            <RecentGamesTable games={recentGames} />
          </Box>
        </Box>
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
