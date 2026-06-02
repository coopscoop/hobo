'use client';

import { useState, useEffect } from 'react';
import { useLeague } from '@/context/LeagueContext';
import { UpcomingGamesTable } from '@/components/home/UpcomingGamesTable';
import { RecentGamesTable } from '@/components/home/RecentGamesTable';
import { NewsList } from '@/components/home/NewsList';
import { Box, Typography, Stack } from '@mui/material';
import type { GameListItem, Announcement } from '@/types';

interface HomePageClientProps {
    initialUpcoming: GameListItem[];
    initialRecent: GameListItem[];
    initialPinned: Announcement[];
    initialSeason: Announcement[];
}

export function HomePageClient({
    initialUpcoming,
    initialRecent,
    initialPinned,
    initialSeason,
}: HomePageClientProps) {
    const { leagueId } = useLeague();

    const [upcomingGames, setUpcomingGames] = useState<GameListItem[]>(initialUpcoming);
    const [recentGames, setRecentGames] = useState<GameListItem[]>(initialRecent);
    const [pinnedNews, setPinnedNews] = useState<Announcement[]>(initialPinned);
    const [seasonNews, setSeasonNews] = useState<Announcement[]>(initialSeason);

    useEffect(() => {
        // Only refetch games when league changes — news isn't league-filtered
        if (leagueId === 'all') {
            setUpcomingGames(initialUpcoming);
            setRecentGames(initialRecent);
            return;
        }

        const params = new URLSearchParams({ leagueId });

        Promise.all([
            fetch(`/api/games/upcoming?${params}`).then((r) => r.json()),
            fetch(`/api/games/recent?${params}`).then((r) => r.json()),
        ]).then(([upcoming, recent]) => {
            setUpcomingGames(upcoming);
            setRecentGames(recent);
        });
    }, [leagueId]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Hamilton Oldtimers Baseball
            </Typography>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    <NewsList title="Pinned" announcements={pinnedNews} />
                    <Box sx={{ mt: 3 }}>
                        <NewsList title="Season News" announcements={seasonNews} />
                    </Box>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <UpcomingGamesTable games={upcomingGames} />
                    <Box sx={{ mt: 3 }}>
                        <RecentGamesTable games={recentGames} />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
}
