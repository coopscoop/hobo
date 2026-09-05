'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLeague } from '@/context/LeagueContext';
import { GamesTable } from '@/components/games/GamesTable';
import { Box, OutlinedInput, InputAdornment, Stack } from '@mui/material';
import { Search } from '@mui/icons-material';
import DateRange from '@/components/DateRange';
import type { GameListItem } from '@/types';
import type { Dayjs } from 'dayjs';

interface GamesPageClientProps {
    initialGames: GameListItem[];
    minYear: number;
    maxYear: number;
}

export function GamesPageClient({ initialGames, minYear, maxYear }: GamesPageClientProps) {
    // const { leagueId } = useLeague();
    const [games, setGames] = useState<GameListItem[]>(initialGames);
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const filteredGames = useMemo(() => {
        return games.filter((g) => {
            if (search) {
                const q = search.toLowerCase();
                const matchesTeam =
                    g.homeTeam.name.toLowerCase().includes(q) ||
                    g.awayTeam.name.toLowerCase().includes(q);
                const matchesVenue = g.location.toLowerCase().includes(q);
                if (!matchesTeam && !matchesVenue) return false;
            }
            if (startDate && new Date(g.date) < startDate.toDate()) return false;
            if (endDate && new Date(g.date) > endDate.toDate()) return false;
            return true;
        });
    }, [games, search, startDate, endDate]);

    return (
        <Box sx={{ px: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                {/* <DateRange */}
                {/*     startDate={startDate} */}
                {/*     endDate={endDate} */}
                {/*     onStartChange={setStartDate} */}
                {/*     onEndChange={setEndDate} */}
                {/*     minYear={minYear} */}
                {/*     maxYear={maxYear} */}
                {/*     yearOnly */}
                {/* /> */}
                <OutlinedInput
                    size="small"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 300 }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Search fontSize="small" />
                        </InputAdornment>
                    }
                />
            </Stack>
            <GamesTable games={filteredGames} />
        </Box>
    );
}
