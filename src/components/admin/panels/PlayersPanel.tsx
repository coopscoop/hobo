// src/components/admin/panels/PlayersPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import { GridColDef } from "@mui/x-data-grid";
import { createPlayer, updatePlayer, deletePlayer } from "@/lib/services/players";

interface Props {
    initialData: any[];
    teams: any[];
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "team", headerName: "Team", flex: 1 },
];

export default function PlayersPanel({ initialData, teams }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState<any | null>(null);

    const rows = useMemo(
        () =>
            initialData.map((p) => ({
                id: p.id,
                firstName: p.firstName ?? "",
                lastName: p.lastName ?? "",
                currentTeamId: p.team?.id ?? null,
                team: p.team?.name ?? "—",
            })),
        [initialData]
    );

    const fields: FormFieldConfig[] = useMemo(
        () => [
            { name: "firstName", label: "First Name" },
            { name: "lastName", label: "Last Name" },
            {
                name: "currentTeam",
                label: "Team",
                type: "select",
                options: [{ value: "none", label: "— No Team —" }, ...teams.map((t) => ({ value: t.id, label: t.teamName }))],
            },
        ],
        [teams]
    );

    return (
        <>
            <AdminEntityPanel
                title="Players"
                rows={rows}
                columns={columns}
                onAdd={() => setEditing({ id: null, firstName: "", lastName: "", currentTeam: "none" })}
                onEdit={(row) =>
                    setEditing({ id: row.id, firstName: row.firstName, lastName: row.lastName, currentTeam: row.currentTeamId ?? "none" })
                }
                onDelete={async (row) => {
                    if (!confirm(`Delete player ${row.firstName} ${row.lastName}? This also removes their roster, batting, and substitute history.`)) return;
                    try {
                        await deletePlayer(row.id);
                        router.refresh();
                    } catch (err: any) {
                        console.error("Failed to delete player", err);
                        alert(err.message ?? "Failed to delete player");
                    }
                }}
            />

            {editing && (
                <FormEditModal
                    open
                    title={editing.id ? "Edit Player" : "Add Player"}
                    fields={fields}
                    initialValues={editing}
                    onClose={() => setEditing(null)}
                    onSave={async (values) => {
                        if (!values.firstName || !values.lastName) {
                            alert("First and last name are required");
                            return;
                        }
                        const payload = {
                            firstName: values.firstName,
                            lastName: values.lastName,
                            currentTeam: values.currentTeam && values.currentTeam !== "none" ? Number(values.currentTeam) : null,
                        };
                        try {
                            if (editing.id) await updatePlayer(editing.id, payload);
                            else await createPlayer(payload);
                            router.refresh();
                            setEditing(null);
                        } catch (err: any) {
                            console.error("Failed to save player", err);
                            alert(err.message ?? "Failed to save player");
                        }
                    }}
                />
            )}
        </>
    );
}
