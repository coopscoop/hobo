// app/admin/panels/AdminEntityPanel.tsx
"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface AdminEntityPanelProps<T extends { id: number | string }> {
  title: string;
  rows: T[];
  columns: GridColDef[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  loading?: boolean;
}

// Generic list+CRUD-affordance panel. Endpoints aren't wired yet, so
// onAdd/onEdit/onDelete are optional no-ops for now — the shape is here
// so wiring them later is a matter of passing real handlers + real rows,
// not restructuring the UI.
export default function AdminEntityPanel<T extends { id: number | string }>({
  title,
  rows,
  columns,
  onAdd,
  onEdit,
  onDelete,
  loading = false,
}: AdminEntityPanelProps<T>) {
  const actionColumn: GridColDef = {
    field: "actions",
    type: "actions",
    headerName: "",
    width: 100,
    getActions: (params) => [
      <GridActionsCellItem
        key="edit"
        icon={<EditIcon fontSize="small" />}
        label="Edit"
        onClick={() => onEdit?.(params.row)}
      />,
      <GridActionsCellItem
        key="delete"
        icon={<DeleteIcon fontSize="small" />}
        label="Delete"
        onClick={() => onDelete?.(params.row)}
      />,
    ],
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Typography variant="h6">{title}</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onAdd}>
          Add New
        </Button>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={[...columns, actionColumn]}
          loading={loading}
          density="compact"
          disableRowSelectionOnClick
          sx={{ height: "100%" }}
        />
      </Box>
    </Box>
  );
}
