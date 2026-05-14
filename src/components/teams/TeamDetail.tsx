'use client';

import { useState, useMemo } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Box, Typography, Paper, Stack, Divider,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import Link from 'next/link';
import type { TeamDetail } from '@/types';
import { useRouter } from 'next/navigation';

type TeamData = NonNullable<TeamDetail>;

interface TeamDetailProps {
  data: TeamData;
  minYear: number;
  maxYear: number;
}

export function TeamDetail({ data, minYear, maxYear }: TeamDetailProps) {
  const { team, recordByYear, rosterByYear } = data;
  const currentYear = maxYear;
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const selectedRecord = useMemo(() => {
    const year = parseInt(selectedYear);
    return recordByYear.find((r) => r.year === year) ?? null;
  }, [recordByYear, selectedYear]);

  const summaryStats = selectedRecord
    ? [
      { label: 'W', value: selectedRecord.wins },
      { label: 'L', value: selectedRecord.losses },
      { label: 'T', value: selectedRecord.ties },
    ]
    : null;

  const rosterRows = useMemo(() =>
    rosterByYear
      .filter((r) => !selectedYear || r.year === parseInt(selectedYear))
      .map((r) => ({
        id: `${r.year}-${r.playerId}`,
        year: r.year,
        playerId: r.playerId,
        firstName: r.firstName,
        lastName: r.lastName,
        gamesPlayed: r.gamesPlayed,
        atBats: r.atBats,
        runs: r.runs,
        hits: r.hits,
        singles: r.singles,
        doubles: r.doubles,
        triples: r.triples,
        homeRuns: r.homeRuns,
        rbi: r.rbi,
        walks: r.walks,
        strikeouts: r.strikeouts,
        hitByPitch: r.hitByPitch,
        stolenBases: r.stolenBases,
        roe: r.roe,
        obp: r.obp ?? '—',
        slg: r.slg ?? '—',
        ops: r.ops ?? '—',
      })),
    [rosterByYear, selectedYear]
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
    { field: 'year', headerName: 'Year', flex: 0.8, type: 'string' },
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

  const router = useRouter();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>{team.teamName}</Typography>

      {/* Year filter */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((y) => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Season record stat box */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {selectedYear} Season Record
        </Typography>
        {summaryStats ? (
          <Paper variant="outlined" sx={{ width: 'fit-content' }}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
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
                  <Typography variant="caption">{label}</Typography>
                  <Typography variant="body1">{value}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No record data for {selectedYear}.
          </Typography>
        )}
      </Box>

      {/* Roster + stats */}
      <Typography variant="h6" gutterBottom>Roster & Batting Stats</Typography>
      <DataGrid
        rows={rosterRows}
        columns={rosterColumns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'lastName', sort: 'asc' }] },
        }}
        pageSizeOptions={[25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{ cursor: 'pointer' }}
        onRowClick={(params) => { router.push(`/players/${params.row.id}`); }}
      />
    </Box>
  );
}
