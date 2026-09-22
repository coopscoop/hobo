'use client';

import { useQueryStates } from 'nuqs';
import { Autocomplete, TextField, ToggleButton, ToggleButtonGroup, Stack, Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { GamesTable } from '@/components/games/GamesTable';
import { gameSearchParsers } from '@/lib/searchParams/games';
import type { GameListItem, TeamWithPlayers } from '@/types';

interface GamesPageClientProps {
    games: GameListItem[];
    minYear: number;
    maxYear: number;
    teams: TeamWithPlayers[];
    fields: { id: number; name: string }[];
}

export function GamesPageClient({ games, teams, fields }: GamesPageClientProps) {
    const [filters, setFilters] = useQueryStates(gameSearchParsers, { shallow: false });

    const selectedTeams = teams.filter((t) => filters.teams?.includes(t.id));
    const selectedField = fields.find((f) => f.id === filters.field) ?? null;

    return (
        <Box sx={{ px: 2 }}>
            <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Autocomplete
                    multiple
                    size="small"
                    sx={{ width: 320 }}
                    options={teams}
                    value={selectedTeams}
                    getOptionLabel={(t) => t.teamName}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    limitTags={2}
                    onChange={(_, value) => {
                        if (value.length > 2) return; // ignore a 3rd pick instead of dropping the oldest
                        setFilters({ teams: value.length ? value.map((t) => t.id) : null });
                    }}
                    renderInput={(params) => <TextField {...params} label="Teams" placeholder="Search teams" />}
                />

                <Autocomplete
                    size="small"
                    sx={{ width: 220 }}
                    options={fields}
                    value={selectedField}
                    getOptionLabel={(f) => f.name}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    onChange={(_, value) => setFilters({ field: value?.id ?? null })}
                    renderInput={(params) => <TextField {...params} label="Field" placeholder="Search fields" />}
                />

                <DatePicker
                    label="From"
                    value={filters.from ? dayjs(filters.from) : null}
                    onChange={(d) => setFilters({ from: d ? d.format('YYYY-MM-DD') : null })}
                    slotProps={{
                        textField: { size: 'small' },
                        field: { clearable: true, onClear: () => setFilters({ from: null }) },
                    }}
                />
                <DatePicker
                    label="To"
                    value={filters.to === 'all' ? null : filters.to ? dayjs(filters.to) : dayjs()}
                    onChange={(d) => setFilters({ to: d ? d.format('YYYY-MM-DD') : 'all' })}
                    slotProps={{
                        textField: { size: 'small' },
                        field: { clearable: true, onClear: () => setFilters({ to: 'all' }) },
                    }}
                />

                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={filters.season}
                    onChange={(_, value) => value && setFilters({ season: value })}
                >
                    <ToggleButton value="regular">Regular Season</ToggleButton>
                    <ToggleButton value="playoffs">Playoffs</ToggleButton>
                    <ToggleButton value="all">All</ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            <GamesTable games={games} />
        </Box>
    );
}
