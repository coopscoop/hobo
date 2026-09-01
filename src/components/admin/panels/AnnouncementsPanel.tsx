// src/components/admin/panels/AnnouncementsPanel.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import MdxEditModal from "@/components/admin/MdxEditModal";
import { GridColDef } from "@mui/x-data-grid";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/services/announcements";

interface Props {
    initialData: any[];
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "type", headerName: "Type", width: 120 },
    { field: "pinned", headerName: "Pinned", width: 90, type: "boolean" },
    { field: "date", headerName: "Posted", width: 130 },
];

export default function AnnouncementsPanel({ initialData }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState<any | null>(null);

    return (
        <>
            <AdminEntityPanel
                title="Announcements"
                rows={initialData}
                columns={columns}
                onAdd={() => setEditing({ id: 0, title: "", date: "", content: "", type: "news", pinned: false })}
                onEdit={(row) => setEditing(row)}
                onDelete={async (row) => {
                    if (!confirm(`Delete announcement "${row.title}"?`)) return;
                    try {
                        await deleteAnnouncement(row.id);
                        router.refresh();
                    } catch (err: any) {
                        console.error("Failed to delete announcement", err);
                        alert(err.message ?? "Failed to delete announcement");
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
                            if (editing.id) await updateAnnouncement(editing.id, { title, content, pinned });
                            else await createAnnouncement({ title, content, pinned });
                            router.refresh();
                            setEditing(null);
                        } catch (err: any) {
                            console.error("Failed to save announcement", err);
                            alert(err.message ?? "Failed to save announcement");
                        }
                    }}
                />
            )}
        </>
    );
}
