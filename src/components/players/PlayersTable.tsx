'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import type { PlayerWithStats } from '@/types';

interface PlayersTableProps {
  players: PlayerWithStats[];
}

export function PlayersTable({ players }: PlayersTableProps) {
  const router = useRouter();

  const rows = players.map((p) => ({
    id:          p.id,
    name:        `${p.firstName} ${p.lastName}`,
    currentTeam: p.currentTeam ?? '—',
    gamesPlayed: p.gamesPlayed,
    atBats:      p.atBats,
    runs:        p.runs,
    hits:        p.hits,
    singles:     p.singles,
    doubles:     p.doubles,
    triples:     p.triples,
    homeRuns:    p.homeRuns,
    rbi:         p.rbi,
    walks:       p.walks,
    strikeouts:  p.strikeouts,
    hitByPitch:  p.hitByPitch,
    stolenBases: p.stolenBases,
    roe:         p.roe,
    obp:         p.obp ?? '—',
    slg:         p.slg ?? '—',
    ops:         p.ops ?? '—',
  }));

  const columns: GridColDef[] = [
    { field: 'name',        headerName: 'Player', flex: 1.5 },
    { field: 'currentTeam', headerName: 'Team',   flex: 1 },
    { field: 'gamesPlayed', headerName: 'GP',     flex: 0.6, type: 'number' },
    { field: 'atBats',      headerName: 'AB',     flex: 0.6, type: 'number' },
    { field: 'runs',        headerName: 'R',      flex: 0.6, type: 'number' },
    { field: 'hits',        headerName: 'H',      flex: 0.6, type: 'number' },
    { field: 'singles',     headerName: '1B',     flex: 0.6, type: 'number' },
    { field: 'doubles',     headerName: '2B',     flex: 0.6, type: 'number' },
    { field: 'triples',     headerName: '3B',     flex: 0.6, type: 'number' },
    { field: 'homeRuns',    headerName: 'HR',     flex: 0.6, type: 'number' },
    { field: 'rbi',         headerName: 'RBI',    flex: 0.6, type: 'number' },
    { field: 'walks',       headerName: 'BB',     flex: 0.6, type: 'number' },
    { field: 'strikeouts',  headerName: 'K',      flex: 0.6, type: 'number' },
    { field: 'hitByPitch',  headerName: 'HBP',    flex: 0.6, type: 'number' },
    { field: 'stolenBases', headerName: 'SB',     flex: 0.6, type: 'number' },
    { field: 'roe',         headerName: 'ROE',    flex: 0.6, type: 'number' },
    { field: 'obp',         headerName: 'OBP',    flex: 0.7 },
    { field: 'slg',         headerName: 'SLG',    flex: 0.7 },
    { field: 'ops',         headerName: 'OPS',    flex: 0.7 },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={{
        pagination: { paginationModel: { pageSize: 25 } },
      }}
      pageSizeOptions={[25, 50, 100]}
      disableRowSelectionOnClick
      onRowClick={(params) => router.push(`/players/${params.row.id}`)}
      sx={{ cursor: 'pointer' }}
      autoHeight
    />
  );
}
