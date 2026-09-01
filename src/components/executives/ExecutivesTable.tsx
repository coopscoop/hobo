'use client';

import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import type { InferSelectModel } from 'drizzle-orm';
import { executives } from '@/lib/db/schema';

type Executive = InferSelectModel<typeof executives>;

interface ExecutivesTableProps {
  executives: Executive[];
}

export function ExecutivesTable({ executives }: ExecutivesTableProps) {
  const columns: GridColDef[] = [
    { field: 'year', headerName: 'Year', width: 100, type: 'string' },
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'position', headerName: 'Position', flex: 1 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <h1>Executives</h1>
      <DataGrid
        rows={executives}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
          sorting: { sortModel: [{ field: 'year', sort: 'desc' }] },
        }}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        autoHeight
      />
    </Box>
  );
}
