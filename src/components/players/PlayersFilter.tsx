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

interface PlayersFilterProps {
  players: PlayerWithStats[];
  yearFrom: string;
  yearTo: string;
  minYear: number;
  maxYear: number;
}

export function PlayersFilter({ players, yearFrom, yearTo, minYear, maxYear }: PlayersFilterProps) {
  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const [, setYearFrom] = useQueryState('yearFrom', { shallow: false });
  const [, setYearTo]   = useQueryState('yearTo',   { shallow: false });
  const [fromInput, setFromInput] = useState(yearFrom);
  const [toInput, setToInput]     = useState(yearTo);
  const [search, setSearch]       = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  function handleApplyYears() {
    setYearFrom(fromInput || null);
    setYearTo(toInput || null);
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
          <InputLabel>From</InputLabel>
          <Select
            value={fromInput}
            label="From"
            onChange={(e) => setFromInput(e.target.value)}
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
            onChange={(e) => setToInput(e.target.value)}
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
