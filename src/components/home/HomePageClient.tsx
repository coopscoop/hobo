'use client';

import { useState, useEffect } from 'react';
import { useLeague } from '@/context/LeagueContext';
import { UpcomingGamesTable } from '@/components/home/UpcomingGamesTable';
import { RecentGamesTable } from '@/components/home/RecentGamesTable';
import { NewsList } from '@/components/home/NewsList';
import { TeamStandings } from '@/components/home/TeamStandings';
import { fetchUpcomingGames, fetchRecentGames } from '@/lib/services/games';
import { fetchTeams } from '@/lib/services/teams';
import { Box, Typography, Stack } from '@mui/material';
import type { GameListItem, Announcement, TeamWithPlayers } from '@/types';

interface HomePageClientProps {
    initialUpcoming: GameListItem[];
    initialRecent: GameListItem[];
    initialStandings: TeamWithPlayers[];
    initialPinned: Announcement[];
    initialSeason: Announcement[];
}

export function HomePageClient({
    initialUpcoming,
    initialRecent,
    initialStandings,
    initialPinned,
    initialSeason,
}: HomePageClientProps) {
    const { leagueId } = useLeague();

    const [upcomingGames, setUpcomingGames] = useState<GameListItem[]>(initialUpcoming);
    const [recentGames, setRecentGames] = useState<GameListItem[]>(initialRecent);
    const [standings, setStandings] = useState<TeamWithPlayers[]>(initialStandings);
    const [pinnedNews] = useState<Announcement[]>(initialPinned);
    const [seasonNews] = useState<Announcement[]>(initialSeason);

    useEffect(() => {
        // News isn't league-filtered, so only games/standings need to refetch.
        if (leagueId === 'all') {
            setUpcomingGames(initialUpcoming);
            setRecentGames(initialRecent);
            setStandings(initialStandings);
            return;
        }

        Promise.all([
            fetchUpcomingGames(leagueId),
            fetchRecentGames(leagueId),
            fetchTeams(leagueId),
        ]).then(([upcoming, recent, teams]) => {
            setUpcomingGames(upcoming);
            setRecentGames(recent);
            setStandings(teams);
        });
    }, [leagueId]);

    return (
        <Box>
            <Box sx={{ px: 4, py: 3, borderBottom: '4px solid', borderColor: 'primary.main', backgroundColor: '#ffffff' }}>
                <Typography variant="h4">Hamilton Oldtimers Baseball</Typography>
            </Box>

            <Box sx={{ p: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 2, minWidth: 0, width: '100%' }}>
                        <NewsList title="Pinned" announcements={pinnedNews} />
                        <Box sx={{ mt: 4 }}>
                            <NewsList title="Season News" announcements={seasonNews} />
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                        <Box sx={{ mt: 4 }}>
                            <TeamStandings teams={standings} />
                        </Box>
                        <UpcomingGamesTable games={upcomingGames} />
                        <Box sx={{ mt: 4 }}>
                            <RecentGamesTable games={recentGames} />
                        </Box>
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}
