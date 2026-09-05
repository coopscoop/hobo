// src/components/admin/panels/PageContentsPanel.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import MdxEditModal from "@/components/admin/MdxEditModal";
import { GridColDef } from "@mui/x-data-grid";
import { updatePageContent } from "@/lib/services/pages";

interface Props {
    initialData: any[];
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "pageName", headerName: "Page", flex: 1 },
];

export default function PageContentsPanel({ initialData }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState<any | null>(null);

    return (
        <>
            <AdminEntityPanel title="Page Contents" rows={initialData} columns={columns} onEdit={(row) => setEditing(row)} />
            {editing && (
                <MdxEditModal
                    open
                    title={`Edit Page: ${editing.pageName}`}
                    initialTitle={editing.pageName}
                    initialContent={editing.content}
                    onClose={() => setEditing(null)}
                    onSave={async ({ content }) => {
                        try {
                            await updatePageContent(editing.id, content);
                            router.refresh();
                            setEditing(null);
                        } catch (err: any) {
                            console.error("Failed to save page content", err);
                            alert(err.message ?? "Failed to save page content");
                        }
                    }}
                />
            )}
        </>
    );
}
