// src/components/admin/panels/PlayersPanel.tsx
"use client";

import { useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "team", headerName: "Team", width: 160 },
];

const fields: FormFieldConfig[] = [
  { name: "name", label: "Name" },
  { name: "team", label: "Team" },
];

export default function PlayersPanel() {
  const rows: any[] = [];
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <>
      <AdminEntityPanel
        title="Players"
        rows={rows}
        columns={columns}
        onAdd={() => setEditing({ id: null, name: "", team: "" })}
        onEdit={(row) => setEditing(row)}
      />
      {editing && (
        <FormEditModal
          open
          title={editing.id ? "Edit Player" : "Add Player"}
          fields={fields}
          initialValues={editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            // TODO: call service once endpoints exist
            console.log("save player", values);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
