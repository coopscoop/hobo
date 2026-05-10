'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import Link from 'next/link';
import type { Announcement } from '@/types';

interface AnnouncementsTableProps {
  announcements: Announcement[];
}

export function AnnouncementsTable({ announcements }: AnnouncementsTableProps) {
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      renderCell: (params) => (
        <Link href={`/announcements/${params.row.id}`}>{params.value}</Link>
      ),
    },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'type', headerName: 'Type', width: 100 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <h1>Announcements</h1>
      <DataGrid
        rows={announcements}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'date', sort: 'desc' }] },
        }}
        pageSizeOptions={[25, 50]}
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
}
