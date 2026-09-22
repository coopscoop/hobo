'use client';

import { useMemo, useState } from 'react';
import { useQueryStates } from 'nuqs';
import { Box, InputAdornment, OutlinedInput, Stack } from '@mui/material';
import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { TeamsTable } from '@/components/teams/TeamsTable';
import { teamSearchParsers } from '@/lib/searchParams/teams';
import type { Team } from '@/lib/types';

interface TeamsPageClientProps {
    teams: Team[];
    minYear: number;
    maxYear: number;
}

export default function TeamsPageClient({ teams, minYear, maxYear }: TeamsPageClientProps) {
    const [filters, setFilters] = useQueryStates(teamSearchParsers, { shallow: false });
    const [search, setSearch] = useState('');

    const minDate = dayjs().year(minYear).startOf('year');
    const maxDate = dayjs().year(maxYear).endOf('year');

    const filteredTeams = useMemo(() => {
        if (!search) return teams;
        const q = search.toLowerCase();
        return teams.filter((t) => t.teamName.toLowerCase().includes(q));
    }, [teams, search]);

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{ mb: 2, ml: 2, alignItems: 'center' }}>
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

                <DatePicker
                    label="Year"
                    views={['year']}
                    minDate={minDate}
                    maxDate={maxDate}
                    value={filters.year === 'all' ? null : dayjs().year(filters.year as number)}
                    onChange={(d) => setFilters({ year: d ? d.year() : 'all' })}
                    slotProps={{
                        textField: { size: 'small' },
                        field: { clearable: true, onClear: () => setFilters({ year: 'all' }) },
                    }}
                />
            </Stack>

            <TeamsTable teams={filteredTeams} />
        </Box>
    );
}
