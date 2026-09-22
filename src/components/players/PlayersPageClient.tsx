'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryStates } from 'nuqs';
import {
    Box, Stack, Checkbox, FormControlLabel,
    OutlinedInput, InputAdornment, Autocomplete, TextField,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { PlayersTable } from './PlayersTable';
import type { PlayerWithStats, TeamWithPlayers } from '@/types';
import { playerSearchParsers } from '@/lib/searchParams/players';

interface PlayersPageClientProps {
    players: PlayerWithStats[];
    teams: TeamWithPlayers[];
    minYear: number;
    maxYear: number;
}

export function PlayersPageClient({ players, teams, minYear, maxYear }: PlayersPageClientProps) {
    const [filters, setFilters] = useQueryStates(playerSearchParsers, { shallow: false });

    const minDate = dayjs().year(minYear).startOf('year');
    const maxDate = dayjs().year(maxYear).endOf('year');

    // local buffer here so typing is instant
    const [searchInput, setSearchInput] = useState(filters.search ?? '');

    // debounce so it doesn't hammer the API
    useEffect(() => {
        const id = setTimeout(() => {
            if (searchInput !== (filters.search ?? '')) {
                setFilters({ search: searchInput || null });
            }
        }, 400);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const selectedTeam = teams.find((t) => t.id === filters.team) ?? null;

    return (
        <Box sx={{ px: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <OutlinedInput
                    size="small"
                    placeholder="Search..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    sx={{ width: 300 }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Search fontSize="small" />
                        </InputAdornment>
                    }
                />

                <Autocomplete
                    size="small"
                    sx={{ width: 220 }}
                    options={teams}
                    value={selectedTeam}
                    getOptionLabel={(t) => t.teamName}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    onChange={(_, value) => setFilters({ team: value?.id ?? null })}
                    renderInput={(params) => <TextField {...params} label="Team" placeholder="Search teams" />}
                />

                <DatePicker
                    label="Year"
                    views={['year']}
                    minDate={minDate}
                    maxDate={maxDate}
                    value={filters.year === 'all' ? null : dayjs().year(filters.year)}
                    onChange={(d) => setFilters({ year: d ? d.year() : 'all' })}
                    slotProps={{
                        textField: { size: 'small' },
                        field: { clearable: true, onClear: () => setFilters({ year: 'all' }) },
                    }}
                />
            </Stack>

            <PlayersTable players={players} />
        </Box>
    );
}
