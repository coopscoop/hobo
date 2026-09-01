// src/components/admin/panels/AnnouncementsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import MdxEditModal from "@/components/admin/MdxEditModal";
import { GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "title", headerName: "Title", flex: 1 },
  { field: "createdAt", headerName: "Posted", width: 160 },
];

interface AnnouncementRow {
    id: number,
    title: number,
    date: string,
    content: string
    type: string,
    pinned: boolean
}

export default function AnnouncementsPanel() {
  const [rows, setRows] = useState<AnnouncementRow[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then(setRows)
      .catch((err) => console.error("Failed to load pages", err));
  }, []);

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
