'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import type { GameListItem } from '@/types';

interface GamesTableProps {
  games: GameListItem[];
}

export function GamesTable({ games }: GamesTableProps) {
  const router = useRouter();

  const rows = games.map((g) => ({
    id:        g.id,
    date:      g.date,
    homeTeam:  g.homeTeam.name,
    awayTeam:  g.awayTeam.name,
    score:     g.homeScore !== null ? `${g.homeScore} - ${g.awayScore}` : '—',
    league:    g.league.name,
    location:  g.location,
    isPlayoff: g.isPlayoff,
  }));

  const columns: GridColDef[] = [
    { field: 'date',      headerName: 'Date',     width: 120 },
    { field: 'homeTeam',  headerName: 'Home',     flex: 1 },
    { field: 'awayTeam',  headerName: 'Away',     flex: 1 },
    { field: 'score',     headerName: 'Score',    width: 100 },
    { field: 'league',    headerName: 'League',   flex: 1 },
    { field: 'location',  headerName: 'Location', flex: 1 },
    { field: 'isPlayoff', headerName: 'Playoff',  width: 90, type: 'boolean' },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
      }}
      pageSizeOptions={[10, 15, 25]}
      disableRowSelectionOnClick
      onRowClick={(params) => router.push(`/games/${params.row.id}`)}
      sx={{ cursor: 'pointer' }}
      autoHeight
    />
  );
}
