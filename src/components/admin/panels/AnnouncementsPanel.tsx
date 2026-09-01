// src/components/admin/panels/AnnouncementsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import MdxEditModal from "@/components/admin/MdxEditModal";
import { GridColDef } from "@mui/x-data-grid";

interface AnnouncementRow {
    id: number;
    title: string;
    date: string;
    content: string;
    type: string;
    pinned: boolean;
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "pinned", headerName: "Pinned", width: 90, type: "boolean" },
    { field: "date", headerName: "Posted", width: 130 },
];

export default function AnnouncementsPanel() {
    const [rows, setRows] = useState<AnnouncementRow[]>([]);
    const [editing, setEditing] = useState<AnnouncementRow | null>(null);

    const fetchAnnouncements = () => {
        fetch("/api/announcements")
            .then((res) => res.json())
            .then(setRows)
            .catch((err) => console.error("Failed to load announcements", err));
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    return (
        <>
            <AdminEntityPanel
                title="Announcements"
                rows={rows}
                columns={columns}
                onAdd={() =>
                    setEditing({ id: 0, title: "New Announcement", date: "", content: "", type: "news", pinned: false })
                }
                onEdit={(row) => setEditing(row)}
                onDelete={async (row) => {
                    if (!confirm(`Delete announcement "${row.title}"?`)) return;
                    try {
                        const res = await fetch(`/api/announcements/${row.id}`, { method: "DELETE" });
                        if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            alert(body.error ?? "Failed to delete announcement");
                            return;
                        }
                        fetchAnnouncements();
                    } catch (err) {
                        console.error("Failed to delete announcement", err);
                        alert("Failed to delete announcement — check console");
                    }
                }}
            />

            {editing && (
                <MdxEditModal
                    open
                    title={editing.id ? `Edit: ${editing.title}` : "New Announcement"}
                    initialTitle={editing.title}
                    initialContent={editing.content}
                    initialPinned={editing.pinned}
                    onClose={() => setEditing(null)}
                    onSave={async ({ title, content, pinned }) => {
                        try {
                            const res = editing.id
                                ? await fetch(`/api/announcements/${editing.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ title, content, pinned }),
                                })
                                : await fetch("/api/announcements", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ title, content, pinned }),
                                });

                            if (!res.ok) {
                                const body = await res.json().catch(() => ({}));
                                alert(body.error ?? "Failed to save announcement");
                                return;
                            }

                            fetchAnnouncements();
                            setEditing(null);
                        } catch (err) {
                            console.error("Failed to save announcement", err);
                            alert("Failed to save announcement — check console");
                        }
                    }}
                />
            )}
        </>
    );
}
