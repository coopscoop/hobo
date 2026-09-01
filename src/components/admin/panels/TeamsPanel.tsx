// src/components/admin/panels/TeamsPanel.tsx
"use client";

import { useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Team", flex: 1 },
  { field: "league", headerName: "League", width: 140 },
];

const fields: FormFieldConfig[] = [
  { name: "name", label: "Team Name" },
  { name: "league", label: "League" },
];

export default function TeamsPanel() {
  const rows: any[] = [];
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <>
      <AdminEntityPanel
        title="Teams"
        rows={rows}
        columns={columns}
        onAdd={() => setEditing({ id: null, name: "", league: "" })}
        onEdit={(row) => setEditing(row)}
      />
      {editing && (
        <FormEditModal
          open
          title={editing.id ? "Edit Team" : "Add Team"}
          fields={fields}
          initialValues={editing}
          onClose={() => setEditing(null)}
          onSave={async (values) => {
            console.log("save team", values);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
