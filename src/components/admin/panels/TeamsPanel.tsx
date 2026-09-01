// src/components/admin/panels/TeamsPanel.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import { GridColDef } from "@mui/x-data-grid";
import { createTeam, updateTeam, deleteTeam } from "@/lib/services/teams";

interface Props {
    initialData: any[];
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "teamName", headerName: "Team", flex: 1 },
    { field: "wins", headerName: "W", width: 70 },
    { field: "losses", headerName: "L", width: 70 },
    { field: "ties", headerName: "T", width: 70 },
];

const fields: FormFieldConfig[] = [{ name: "teamName", label: "Team Name" }];

export default function TeamsPanel({ initialData }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState<any | null>(null);

    return (
        <>
            <AdminEntityPanel
                title="Teams"
                rows={initialData}
                columns={columns}
                onAdd={() => setEditing({ id: null, teamName: "" })}
                onEdit={(row) => setEditing({ id: row.id, teamName: row.teamName })}
                onDelete={async (row) => {
                    if (!confirm(`Delete team ${row.teamName}?`)) return;
                    try {
                        await deleteTeam(row.id);
                        router.refresh();
                    } catch (err: any) {
                        console.error("Failed to delete team", err);
                        alert(err.message ?? "Failed to delete team");
                    }
                }}
            />

            {editing && (
                <FormEditModal
                    open
                    title={editing.id ? "Edit Team" : "Add Team"}
                    fields={fields}
                    initialValues={editing}
                    onClose={() => setEditing(null)}
                    onSave={async (values) => {
                        if (!values.teamName?.trim()) {
                            alert("Team name is required");
                            return;
                        }
                        try {
                            if (editing.id) await updateTeam(editing.id, values.teamName);
                            else await createTeam(values.teamName);
                            router.refresh();
                            setEditing(null);
                        } catch (err: any) {
                            console.error("Failed to save team", err);
                            alert(err.message ?? "Failed to save team");
                        }
                    }}
                />
            )}
        </>
    );
}
