// src/components/admin/panels/AnnouncementsPanel.tsx
"use client";

import { useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import MdxEditModal from "@/components/admin/MdxEditModal";
import { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "title", headerName: "Title", flex: 1 },
  { field: "createdAt", headerName: "Posted", width: 160 },
];

export default function AnnouncementsPanel() {
  const rows: any[] = [];
  const [editing, setEditing] = useState<any | null>(null);

  return (
    <>
      <AdminEntityPanel
        title="Announcements"
        rows={rows}
        columns={columns}
        onAdd={() => setEditing({ id: null, title: "", content: "" })}
        onEdit={(row) => setEditing(row)}
      />
      {editing && (
        <MdxEditModal
          open
          title={editing.id ? "Edit Announcement" : "New Announcement"}
          initialContent={editing.content ?? ""}
          onClose={() => setEditing(null)}
          onSave={async (content) => {
            console.log("save announcement", { ...editing, content });
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
