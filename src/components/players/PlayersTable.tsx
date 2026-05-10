'use client';

import { useState, useMemo } from 'react';
import { useQueryState } from 'nuqs';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Checkbox, FormControlLabel, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Link from 'next/link';
import type { PlayerWithStats } from '@/types';

interface PlayersTableProps {
  players: PlayerWithStats[];
  yearFrom: string;
  yearTo: string;
  minYear: number;
  maxYear: number;
}

export function PlayersTable({ players, yearFrom, yearTo, minYear, maxYear }: PlayersTableProps) {
  // Replace hardcoded years array with:
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const [, setYearFrom] = useQueryState('yearFrom', { shallow: false });
  const [, setYearTo] = useQueryState('yearTo', { shallow: false });
  const [fromInput, setFromInput] = useState(yearFrom);
  const [toInput, setToInput] = useState(yearTo);

  const [activeOnly, setActiveOnly] = useState(false);

  function handleApplyYears() {
    setYearFrom(fromInput || null);
    setYearTo(toInput || null);
  }

  const rows = useMemo(() => {
    return players
      .filter((p) => !activeOnly || p.currentTeam !== null)
      .map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        currentTeam: p.currentTeam ?? '—',
        gamesPlayed: p.gamesPlayed,
        atBats: p.atBats,
        runs: p.runs,
        hits: p.hits,
        singles: p.singles,
        doubles: p.doubles,
        triples: p.triples,
        homeRuns: p.homeRuns,
        rbi: p.rbi,
        walks: p.walks,
        strikeouts: p.strikeouts,
        hitByPitch: p.hitByPitch,
        stolenBases: p.stolenBases,
        roe: p.roe,
        obp: p.obp ?? '—',
        slg: p.slg ?? '—',
        ops: p.ops ?? '—',
      }));
  }, [players, activeOnly]);

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Player',
      width: 160,
      renderCell: (params) => (
        <Link href={`/players/${params.row.id}`}>{params.value}</Link>
      ),
    },
    { field: 'currentTeam', headerName: 'Team', width: 120 },
    { field: 'gamesPlayed', headerName: 'GP', width: 70, type: 'number' },
    { field: 'atBats', headerName: 'AB', width: 70, type: 'number' },
    { field: 'runs', headerName: 'R', width: 70, type: 'number' },
    { field: 'hits', headerName: 'H', width: 70, type: 'number' },
    { field: 'singles', headerName: '1B', width: 70, type: 'number' },
    { field: 'doubles', headerName: '2B', width: 70, type: 'number' },
    { field: 'triples', headerName: '3B', width: 70, type: 'number' },
    { field: 'homeRuns', headerName: 'HR', width: 70, type: 'number' },
    { field: 'rbi', headerName: 'RBI', width: 70, type: 'number' },
    { field: 'walks', headerName: 'BB', width: 70, type: 'number' },
    { field: 'strikeouts', headerName: 'K', width: 70, type: 'number' },
    { field: 'hitByPitch', headerName: 'HBP', width: 70, type: 'number' },
    { field: 'stolenBases', headerName: 'SB', width: 70, type: 'number' },
    { field: 'roe', headerName: 'ROE', width: 70, type: 'number' },
    { field: 'obp', headerName: 'OBP', width: 80 },
    { field: 'slg', headerName: 'SLG', width: 80 },
    { field: 'ops', headerName: 'OPS', width: 80 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <h1>Players</h1>

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>From</InputLabel>
          <Select
            value={fromInput}
            label="From"
            onChange={(e) => setFromInput(e.target.value as string)}
          >
            <MenuItem value="">All</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>To</InputLabel>
          <Select
            value={toInput}
            label="To"
            onChange={(e) => setToInput(e.target.value as string)}
          >
            <MenuItem value="">All</MenuItem>
            {years.map((y) => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" size="small" onClick={handleApplyYears}>
          Apply
        </Button>

        <FormControlLabel
          control={
            <Checkbox
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
          }
          label="Active players only"
        />
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
}
