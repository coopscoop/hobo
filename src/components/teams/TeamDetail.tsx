'use client';

import { useMemo, useState } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TeamDetail as TeamDetailType } from '@/types';

type TeamData = NonNullable<TeamDetailType>;

interface TeamDetailProps {
    data: TeamData;
    minYear: number;
    maxYear: number;
}

export function TeamDetail({
    data,
    minYear,
    maxYear,
}: TeamDetailProps) {
    const { team, recordByYear, rosterByYear } = data;
    const router = useRouter();

    const [selectedYear, setSelectedYear] = useState(maxYear);

    const years = useMemo(
        () =>
            Array.from(
                { length: maxYear - minYear + 1 },
                (_, i) => maxYear - i,
            ),
        [minYear, maxYear],
    );

    const selectedRecord = useMemo(
        () =>
            recordByYear.find(
                (record) => record.year === selectedYear,
            ) ?? null,
        [recordByYear, selectedYear],
    );

    const summaryStats = selectedRecord
        ? [
              { label: 'W', value: selectedRecord.wins },
              { label: 'L', value: selectedRecord.losses },
              { label: 'T', value: selectedRecord.ties },
          ]
        : null;

    const rosterRows = useMemo(
        () =>
            rosterByYear
                .filter((roster) => roster.year === selectedYear)
                .map((roster) => ({
                    id: `${roster.year}-${roster.playerId}`,
                    year: roster.year,
                    playerId: roster.playerId,
                    firstName: roster.firstName,
                    lastName: roster.lastName,
                    gamesPlayed: roster.gamesPlayed,
                    atBats: roster.atBats,
                    runs: roster.runs,
                    hits: roster.hits,
                    singles: roster.singles,
                    doubles: roster.doubles,
                    triples: roster.triples,
                    homeRuns: roster.homeRuns,
                    rbi: roster.rbi,
                    walks: roster.walks,
                    strikeouts: roster.strikeouts,
                    hitByPitch: roster.hitByPitch,
                    stolenBases: roster.stolenBases,
                    roe: roster.roe,
                    obp: roster.obp ?? '—',
                    slg: roster.slg ?? '—',
                    ops: roster.ops ?? '—',
                })),
        [rosterByYear, selectedYear],
    );

    const rosterColumns: GridColDef[] = [
        {
            field: 'lastName',
            headerName: 'Player',
            flex: 1.5,
            renderCell: (params) => (
                <Link href={`/players/${params.row.playerId}`}>
                    {params.row.firstName} {params.row.lastName}
                </Link>
            ),
        },
        { field: 'year', headerName: 'Year', flex: 0.8, type: 'number' },
        { field: 'gamesPlayed', headerName: 'GP', flex: 0.6, type: 'number' },
        { field: 'atBats', headerName: 'AB', flex: 0.6, type: 'number' },
        { field: 'runs', headerName: 'R', flex: 0.6, type: 'number' },
        { field: 'hits', headerName: 'H', flex: 0.6, type: 'number' },
        { field: 'singles', headerName: '1B', flex: 0.6, type: 'number' },
        { field: 'doubles', headerName: '2B', flex: 0.6, type: 'number' },
        { field: 'triples', headerName: '3B', flex: 0.6, type: 'number' },
        { field: 'homeRuns', headerName: 'HR', flex: 0.6, type: 'number' },
        { field: 'rbi', headerName: 'RBI', flex: 0.6, type: 'number' },
        { field: 'walks', headerName: 'BB', flex: 0.6, type: 'number' },
        { field: 'strikeouts', headerName: 'K', flex: 0.6, type: 'number' },
        { field: 'hitByPitch', headerName: 'HBP', flex: 0.6, type: 'number' },
        { field: 'stolenBases', headerName: 'SB', flex: 0.6, type: 'number' },
        { field: 'roe', headerName: 'ROE', flex: 0.6, type: 'number' },
        { field: 'obp', headerName: 'OBP', flex: 0.7 },
        { field: 'slg', headerName: 'SLG', flex: 0.7 },
        { field: 'ops', headerName: 'OPS', flex: 0.7 },
    ];

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                {team.teamName}
            </Typography>

            <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 3, alignItems: 'center' }}
            >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>

                    <Select
                        value={selectedYear}
                        label="Year"
                        onChange={(event) =>
                            setSelectedYear(Number(event.target.value))
                        }
                    >
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    {selectedYear} Season Record
                </Typography>

                {summaryStats ? (
                    <Paper variant="outlined" sx={{ width: 'fit-content' }}>
                        <Stack
                            direction="row"
                            divider={
                                <Divider
                                    orientation="vertical"
                                    flexItem
                                />
                            }
                        >
                            {summaryStats.map(({ label, value }) => (
                                <Box
                                    key={label}
                                    sx={{
                                        px: 2.5,
                                        py: 1.5,
                                        textAlign: 'center',
                                        minWidth: 56,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Typography variant="caption">
                                        {label}
                                    </Typography>
                                    <Typography variant="body1">
                                        {value}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        No record data for {selectedYear}.
                    </Typography>
                )}
            </Box>

            <Typography variant="h6" gutterBottom>
                Roster &amp; Batting Stats
            </Typography>

            <DataGrid
                rows={rosterRows}
                columns={rosterColumns}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 25 },
                    },
                    sorting: {
                        sortModel: [
                            {
                                field: 'lastName',
                                sort: 'asc',
                            },
                        ],
                    },
                }}
                pageSizeOptions={[25, 50]}
                disableRowSelectionOnClick
                autoHeight
                sx={{ cursor: 'pointer' }}
                onRowClick={(params) => {
                    router.push(
                        `/players/${params.row.playerId}`,
                    );
                }}
            />
        </Box>
    );
}
