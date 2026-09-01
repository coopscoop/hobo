// src/components/admin/panels/PageContentsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import MdxEditModal from "@/components/admin/MdxEditModal";
import { GridColDef } from "@mui/x-data-grid";

interface PageRow {
  id: number;
  pageName: string;
  content: string;
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "pageName", headerName: "Page", flex: 1 },
];

export default function PageContentsPanel() {
  const [rows, setRows] = useState<PageRow[]>([]);
  const [editing, setEditing] = useState<PageRow | null>(null);

  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then(setRows)
      .catch((err) => console.error("Failed to load pages", err));
  }, []);

  return (
    <>
      <AdminEntityPanel title="Page Contents" rows={rows} columns={columns} onEdit={(row) => setEditing(row)} />
      {editing && (
        <MdxEditModal
          open
          title={`Edit Page: ${editing.pageName}`}
          initialContent={editing.content}
          onClose={() => setEditing(null)}
          onSave={async (content) => {
            const res = await fetch(`/api/pages/${editing.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content }),
            });
            if (!res.ok) {
              console.error("Failed to save page content");
              return;
            }
            const updated: PageRow = await res.json();
            setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
