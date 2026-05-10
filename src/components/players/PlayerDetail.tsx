'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Chip, Stack, Paper, Divider } from '@mui/material';
import type { PlayerById, PlayerGameLog } from '@/types';

type PlayerData = NonNullable<PlayerById>;

interface PlayerDetailProps {
  data: PlayerData;
  gameLog: PlayerGameLog;
  currentYear: number;
}

export function PlayerDetail({ data, gameLog, currentYear }: PlayerDetailProps) {
  const { player, statsByYear } = data;

  const currentSeason = statsByYear.find((s) => s.year === currentYear) ?? null;

  // ---- Game log rows ----
  const gameLogRows = gameLog.map((g) => {
    const opponent =
      g.rosterTeamId === g.homeTeamId ? g.awayTeamName : g.homeTeamName;
    return {
      id: g.gameId,
      date: g.date,
      playerTeam: g.playerTeam ?? '—',
      opponent: opponent ?? '—',
      atBat: g.atBat ?? 0,
      run: g.run ?? 0,
      hits: (g.singleHit ?? 0) + (g.doubleHit ?? 0) + (g.tripleHit ?? 0) + (g.homeRun ?? 0),
      singles: g.singleHit ?? 0,
      doubles: g.doubleHit ?? 0,
      triples: g.tripleHit ?? 0,
      homeRuns: g.homeRun ?? 0,
      rbi: g.rbi ?? 0,
      walks: g.walk ?? 0,
      strikeouts: g.strikeout ?? 0,
      hitByPitch: g.hitByPitch ?? 0,
      stolenBases: g.stolenBase ?? 0,
      roe: g.roe ?? 0,
      sacrifice: g.sacrifice ?? 0,
    };
  });

  const gameLogColumns: GridColDef[] = [
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'playerTeam', headerName: 'Team', flex: 0.8 },
    { field: 'opponent', headerName: 'Opponent', flex: 0.8 },
    { field: 'atBat', headerName: 'AB', flex: 0.5, type: 'number' },
    { field: 'run', headerName: 'R', flex: 0.5, type: 'number' },
    { field: 'hits', headerName: 'H', flex: 0.5, type: 'number' },
    { field: 'singles', headerName: '1B', flex: 0.5, type: 'number' },
    { field: 'doubles', headerName: '2B', flex: 0.5, type: 'number' },
    { field: 'triples', headerName: '3B', flex: 0.5, type: 'number' },
    { field: 'homeRuns', headerName: 'HR', flex: 0.5, type: 'number' },
    { field: 'rbi', headerName: 'RBI', flex: 0.5, type: 'number' },
    { field: 'walks', headerName: 'BB', flex: 0.5, type: 'number' },
    { field: 'strikeouts', headerName: 'K', flex: 0.5, type: 'number' },
    { field: 'hitByPitch', headerName: 'HBP', flex: 0.5, type: 'number' },
    { field: 'stolenBases', headerName: 'SB', flex: 0.5, type: 'number' },
    { field: 'roe', headerName: 'ROE', flex: 0.5, type: 'number' },
    { field: 'sacrifice', headerName: 'SAC', flex: 0.5, type: 'number' },
  ];

  // ---- Career stats rows ----
  const careerRows = statsByYear.map((s) => ({
    id: s.year,
    year: s.year,
    teamName: s.teamName,
    gamesPlayed: s.gamesPlayed,
    atBats: s.atBats,
    runs: s.runs,
    hits: s.hits,
    singles: s.singles,
    doubles: s.doubles,
    triples: s.triples,
    homeRuns: s.homeRuns,
    rbi: s.rbi,
    walks: s.walks,
    strikeouts: s.strikeouts,
    hitByPitch: s.hitByPitch,
    stolenBases: s.stolenBases,
    roe: s.roe,
    obp: s.obp ?? '—',
    slg: s.slg ?? '—',
    ops: s.ops ?? '—',
  }));

  const careerColumns: GridColDef[] = [
    { field: 'year', headerName: 'Year', flex: 0.7, type: 'string' },
    { field: 'teamName', headerName: 'Team', flex: 0.8 },
    { field: 'gamesPlayed', headerName: 'GP', flex: 0.5, type: 'number' },
    { field: 'atBats', headerName: 'AB', flex: 0.5, type: 'number' },
    { field: 'runs', headerName: 'R', flex: 0.5, type: 'number' },
    { field: 'hits', headerName: 'H', flex: 0.5, type: 'number' },
    { field: 'singles', headerName: '1B', flex: 0.5, type: 'number' },
    { field: 'doubles', headerName: '2B', flex: 0.5, type: 'number' },
    { field: 'triples', headerName: '3B', flex: 0.5, type: 'number' },
    { field: 'homeRuns', headerName: 'HR', flex: 0.5, type: 'number' },
    { field: 'rbi', headerName: 'RBI', flex: 0.5, type: 'number' },
    { field: 'walks', headerName: 'BB', flex: 0.5, type: 'number' },
    { field: 'strikeouts', headerName: 'K', flex: 0.5, type: 'number' },
    { field: 'hitByPitch', headerName: 'HBP', flex: 0.5, type: 'number' },
    { field: 'stolenBases', headerName: 'SB', flex: 0.5, type: 'number' },
    { field: 'roe', headerName: 'ROE', flex: 0.5, type: 'number' },
    { field: 'obp', headerName: 'OBP', flex: 0.6 },
    { field: 'slg', headerName: 'SLG', flex: 0.6 },
    { field: 'ops', headerName: 'OPS', flex: 0.6 },
  ];

  // ---- Stat strip items ----
  const summaryStats = currentSeason
    ? [
      { label: 'GP', value: currentSeason.gamesPlayed },
      { label: 'AB', value: currentSeason.atBats },
      { label: 'H', value: currentSeason.hits },
      { label: 'HR', value: currentSeason.homeRuns },
      { label: 'RBI', value: currentSeason.rbi },
      { label: 'R', value: currentSeason.runs },
      { label: 'BB', value: currentSeason.walks },
      { label: 'K', value: currentSeason.strikeouts },
      { label: 'SB', value: currentSeason.stolenBases },
      { label: 'OBP', value: currentSeason.obp ?? '—' },
      { label: 'SLG', value: currentSeason.slg ?? '—' },
      { label: 'OPS', value: currentSeason.ops ?? '—' },
    ]
    : null;

  // ---- Table rows ----
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" gutterBottom>
          {player.firstName} {player.lastName}
        </Typography>
        <Stack direction="row" spacing={2}>
          {player.currentTeam && <Chip label={player.currentTeam} size="small" />}
        </Stack>
      </Box>

      {/* Current Season Summary */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {currentYear} Season
        </Typography>
        {summaryStats ? (
          <Paper variant="outlined">
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              sx={{ overflowX: 'auto' }}
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
          <Typography variant="body2" color="text.secondary">
            No data for the {currentYear} season.
          </Typography>
        )}
      </Box>

      {/* Game Log */}
      <Box>
        <Typography variant="h6" gutterBottom>
          {currentYear} Game Log
        </Typography>
        {gameLog.length > 0 ? (
          <DataGrid
            rows={gameLogRows}
            columns={gameLogColumns}
            initialState={{
              sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No games played in {currentYear}.
          </Typography>
        )}
      </Box>

      {/* Career Stats */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Year-by-Year
        </Typography>
        <DataGrid
          rows={careerRows}
          columns={careerColumns}
          initialState={{
            sorting: { sortModel: [{ field: 'year', sort: 'desc' }] },
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
