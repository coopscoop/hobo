// src/components/admin/panels/GamesPanel.tsx
"use client";

import { useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import GamesEditModal from "@/components/admin/GamesEditModal";
import { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "date", headerName: "Date", width: 120 },
  { field: "homeTeam", headerName: "Home", flex: 1 },
  { field: "awayTeam", headerName: "Away", flex: 1 },
  { field: "field", headerName: "Field", width: 140 },
];

// Creation uses the generic form modal (teams/field/date) — separate concern
// from scoring, matching your existing create-page/edit-page split.
const createFields: FormFieldConfig[] = [
  { name: "homeTeam", label: "Home Team" },
  { name: "awayTeam", label: "Away Team" },
  { name: "field", label: "Field" },
  { name: "date", label: "Date" },
];

export default function GamesPanel() {
  const rows: any[] = [];
  const [creating, setCreating] = useState<any | null>(null);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  return (
    <>
      <AdminEntityPanel
        title="Games"
        rows={rows}
        columns={columns}
        onAdd={() => setCreating({ homeTeam: "", awayTeam: "", field: "", date: "" })}
        onEdit={(row) => setEditingGameId(String(row.id))}
      />

      {creating && (
        <FormEditModal
          open
          title="Create Game"
          fields={createFields}
          initialValues={creating}
          onClose={() => setCreating(null)}
          onSave={async (values) => {
            // TODO: POST to games create endpoint once it's wired
            console.log("create game", values);
            setCreating(null);
          }}
        />
      )}

      {editingGameId && (
        <GamesEditModal open gameId={editingGameId} onClose={() => setEditingGameId(null)} />
      )}
    </>
  );
}
