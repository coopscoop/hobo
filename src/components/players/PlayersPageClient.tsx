'use client';

import { useState, useMemo } from 'react';
import { useQueryState } from 'nuqs';
import {
    Box, Stack, Button, FormControl, InputLabel, Select, MenuItem,
    Checkbox, FormControlLabel, OutlinedInput, InputAdornment
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import { PlayersTable } from './PlayersTable';
import type { PlayerWithStats } from '@/types';
import DateRange from '@/components/DateRange';
import type { Dayjs } from 'dayjs';

interface PlayersPageClientProps {
    players: PlayerWithStats[];
    yearFrom: string;
    yearTo: string;
    minYear: number;
    maxYear: number;
}

export function PlayersPageClient({ players, yearFrom, yearTo, minYear, maxYear }: PlayersPageClientProps) {
    const [, setYearFrom] = useQueryState('yearFrom', { shallow: false });
    const [, setYearTo] = useQueryState('yearTo', { shallow: false });
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [search, setSearch] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);

    function handleApplyDates() {
        setYearFrom(startDate ? String(startDate.year()) : null);
        setYearTo(endDate ? String(endDate.year()) : null);
    }

    const filteredPlayers = useMemo(() => {
        return players.filter((p) => {
            if (activeOnly && !p.currentTeam) return false;
            if (search) {
                const full = `${p.firstName} ${p.lastName}`.toLowerCase();
                if (!full.includes(search.toLowerCase())) return false;
            }
            return true;
        });
    }, [players, activeOnly, search]);

    return (
        <Box sx={{ p: 2 }}>
            <h1>Players</h1>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <DateRange
                        startDate={startDate}
                        endDate={endDate}
                        onStartChange={setStartDate}
                        onEndChange={setEndDate}
                        onApply={handleApplyDates}
                        minYear={minYear}
                        maxYear={maxYear}
                        yearOnly
                    />
                </FormControl>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={activeOnly}
                            onChange={(e) => setActiveOnly(e.target.checked)}
                        />
                    }
                    label="Active players only"
                />

                <OutlinedInput
                    size="small"
                    placeholder="Search players..."
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

            <PlayersTable players={filteredPlayers} />
        </Box>
    );
}
