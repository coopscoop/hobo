// src/components/admin/panels/TeamsPanel.tsx
"use client";

import { useEffect, useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import { GridColDef } from "@mui/x-data-grid";

interface TeamRow {
    id: number;
    teamName: string;
    wins: number;
    losses: number;
    ties: number;
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "teamName", headerName: "Team", flex: 1 },
    { field: "wins", headerName: "W", width: 70 },
    { field: "losses", headerName: "L", width: 70 },
    { field: "ties", headerName: "T", width: 70 },
];

const fields: FormFieldConfig[] = [{ name: "teamName", label: "Team Name" }];

export default function TeamsPanel() {
    const [rows, setRows] = useState<TeamRow[]>([]);
    const [editing, setEditing] = useState<any | null>(null);

    const fetchTeams = () => {
        fetch("/api/teams")
            .then((res) => res.json())
            .then(setRows)
            .catch((err) => console.error("Failed to load teams", err));
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    return (
        <>
            <AdminEntityPanel
                title="Teams"
                rows={rows}
                columns={columns}
                onAdd={() => setEditing({ id: null, teamName: "" })}
                onEdit={(row) => setEditing({ id: row.id, teamName: row.teamName })}
                onDelete={async (row) => {
                    if (!confirm(`Delete team ${row.teamName}?`)) return;
                    try {
                        const res = await fetch(`/api/teams/${row.id}`, { method: "DELETE" });
                        if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            alert(body.error ?? "Failed to delete team");
                            return;
                        }
                        fetchTeams();
                    } catch (err) {
                        console.error("Failed to delete team", err);
                        alert("Failed to delete team — check console");
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
                            const res = editing.id
                                ? await fetch(`/api/teams/${editing.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ teamName: values.teamName }),
                                })
                                : await fetch("/api/teams", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ teamName: values.teamName }),
                                });

                            if (!res.ok) {
                                const body = await res.json().catch(() => ({}));
                                alert(body.error ?? "Failed to save team");
                                return;
                            }

                            fetchTeams();
                            setEditing(null);
                        } catch (err) {
                            console.error("Failed to save team", err);
                            alert("Failed to save team — check console");
                        }
                    }}
                />
            )}
        </>
    );
}
