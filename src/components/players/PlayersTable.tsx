'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Checkbox, FormControlLabel, Stack, Select, MenuItem, FormControl, InputLabel, InputAdornment, OutlinedInput } from '@mui/material';
import Search from '@mui/icons-material/Search';
import Link from 'next/link';
import type { PlayerWithStats } from '@/types';
import { useRouter } from 'next/navigation';

interface PlayersTableProps {
  players: PlayerWithStats[];
  yearFrom: string;
  yearTo: string;
  minYear: number;
  maxYear: number;
}

export function PlayersTable({ players, yearFrom, yearTo, minYear, maxYear }: PlayersTableProps) {
  // all years in range given
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const [, setYearFrom] = useQueryState('yearFrom', { shallow: false });
  const [, setYearTo] = useQueryState('yearTo', { shallow: false });
  const [fromInput, setFromInput] = useState(yearFrom);
  const [toInput, setToInput] = useState(yearTo);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // for a delay with searching/debounce for search
  const [activeOnly, setActiveOnly] = useState(false);

  const router = useRouter();

  // debounce search, aleviates some of the lag when initially typing, first block out still jitters though
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const filteredRows = rows.filter((rows) => {
    const full = `${rows.name}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

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

        <OutlinedInput
          size="small"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2, width: 300 }}
          startAdornment={
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          }
        />

      </Stack>
      <DataGrid
        rows={filteredRows}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 15, 25]}
        disableRowSelectionOnClick
        sx={{ cursor: 'pointer' }}
        onRowClick={(params) => { router.push(`/players/${params.row.id}`); }}
        autoHeight
      />
    </Box>
  );
}
