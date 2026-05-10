'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import type { Team } from '@/types';

type Team = Awaited<ReturnType<typeof import('@/db/queries/teams').getTeams>>[number];

interface TeamsTableProps {
  teams: Team[];
}

export function TeamsTable({ teams }: TeamsTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'teamName',
      headerName: 'Team',
      flex: 2,
      renderCell: (params) => (
        <Link href={`/teams/${params.row.id}`}>{params.value}</Link>
      ),
    },
    { field: 'wins', headerName: 'W', flex: 1, type: 'number' },
    { field: 'losses', headerName: 'L', flex: 1, type: 'number' },
    { field: 'ties', headerName: 'T', flex: 1, type: 'number' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>Teams</Typography>
      <DataGrid
        rows={teams}
        columns={columns}
        initialState={{
          sorting: { sortModel: [{ field: 'teamName', sort: 'asc' }] },
        }}
        hideFooter={teams.length <= 25}
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
}
