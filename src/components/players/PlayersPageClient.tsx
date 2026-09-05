'use client';

import { useMemo, useState } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import {
    Box,
    Stack,
    Checkbox,
    FormControl,
    FormControlLabel,
    OutlinedInput,
    InputAdornment,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { PlayersTable } from './PlayersTable';
import type { PlayerWithStats } from '@/types';
import DateRange from '@/components/DateRange';

interface PlayersPageClientProps {
    players: PlayerWithStats[];
    // yearFrom: string;
    // yearTo: string;
}

export function PlayersPageClient({
    players,
    // yearFrom,
    // yearTo,
}: PlayersPageClientProps) {
    // const [{ yearFrom: queryYearFrom, yearTo: queryYearTo }, setYears] =
    //     useQueryStates(
    //         {
    //             yearFrom: parseAsString,
    //             yearTo: parseAsString,
    //         },
    //         {
    //             shallow: false,
    //         },
    //     );

    const [search, setSearch] = useState('');
    const [activeOnly, setActiveOnly] = useState(false);

    // const startDate = queryYearFrom
    //     ? dayjs().year(Number(queryYearFrom))
    //     : null;
    //
    // const endDate = queryYearTo
    //     ? dayjs().year(Number(queryYearTo))
    //     : null;

    const filteredPlayers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return players.filter((player) => {
            if (activeOnly && !player.currentTeamId) {
                return false;
            }

            if (normalizedSearch) {
                const fullName =
                    `${player.firstName ?? ''} ${player.lastName ?? ''}`
                        .trim()
                        .toLowerCase();

                if (!fullName.includes(normalizedSearch)) {
                    return false;
                }
            }

            return true;
        });
    }, [players, activeOnly, search]);

    // const handleStartDateChange = async (date: Dayjs | null) => {
    //     await setYears({
    //         yearFrom: date ? String(date.year()) : null,
    //     });
    // };
    //
    // const handleEndDateChange = async (date: Dayjs | null) => {
    //     await setYears({
    //         yearTo: date ? String(date.year()) : null,
    //     });
    // };

    return (
        <Box sx={{px: 2}}>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    mb: 2,
                    alignItems: 'center',
                }}
            >
                {/* <FormControl size="small" sx={{ minWidth: 100 }}> */}
                {/*     <DateRange */}
                {/*         startDate={startDate} */}
                {/*         endDate={endDate} */}
                {/*         onStartChange={handleStartDateChange} */}
                {/*         onEndChange={handleEndDateChange} */}
                {/*         minYear={Number(yearFrom)} */}
                {/*         maxYear={Number(yearTo)} */}
                {/*         yearOnly */}
                {/*     /> */}
                {/* </FormControl> */}

                <OutlinedInput
                    size="small"
                    placeholder="Search..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ width: 300 }}
                    startAdornment={
                        <InputAdornment position="start">
                            <Search fontSize="small" />
                        </InputAdornment>
                    }
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={activeOnly}
                            onChange={(event) =>
                                setActiveOnly(event.target.checked)
                            }
                        />
                    }
                    label="Active players only"
                />
            </Stack>

            <PlayersTable players={filteredPlayers} />
        </Box>
    );
}
