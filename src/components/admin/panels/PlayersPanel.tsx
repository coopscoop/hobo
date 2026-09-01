// src/components/admin/panels/PlayersPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import { GridColDef } from "@mui/x-data-grid";

interface PlayerRow {
    id: number;
    firstName: string;
    lastName: string;
    currentTeamId: number | null;
    team: string;
}

interface Option {
    id: number;
    name: string;
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "team", headerName: "Team", width: 160 },
];

export default function PlayersPanel() {
    const [rows, setRows] = useState<PlayerRow[]>([]);
    const [teams, setTeams] = useState<Option[]>([]);
    const [editing, setEditing] = useState<any | null>(null);

    const fetchPlayers = () => {
        fetch("/api/players")
            .then((res) => res.json())
            .then((players: any[]) => {
                setRows(
                    players.map((p) => ({
                        id: p.id,
                        firstName: p.firstName ?? "",
                        lastName: p.lastName ?? "",
                        currentTeamId: p.currentTeam?.id ?? null,
                        team: p.team?.name ?? "—",
                    }))
                );
            })
            .catch((err) => console.error("Failed to load players", err));
    };

    useEffect(() => {
        fetchPlayers();
        fetch("/api/teams")
            .then((res) => res.json())
            .then((teams: any[]) => setTeams(teams.map((t) => ({ id: t.id, name: t.teamName }))))
            .catch((err) => console.error("Failed to load teams", err));
    }, []);

    const fields: FormFieldConfig[] = useMemo(
        () => [
            { name: "firstName", label: "First Name" },
            { name: "lastName", label: "Last Name" },
            {
                name: "currentTeam",
                label: "Team",
                type: "select",
                options: [
                    { value: "none", label: "— No Team —" },
                    ...teams.map((t) => ({ value: t.id, label: t.name })),
                ],
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
                    setEditing({
                        id: row.id,
                        firstName: row.firstName,
                        lastName: row.lastName,
                        currentTeam: row.currentTeamId ?? "none",
                    })
                }
                onDelete={async (row) => {
                    if (!confirm(`Delete player ${row.firstName} ${row.lastName}? This also removes their roster, batting, and substitute history.`)) return;
                    try {
                        const res = await fetch(`/api/players/${row.id}`, { method: "DELETE" });
                        if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            alert(body.error ?? "Failed to delete player");
                            return;
                        }
                        fetchPlayers();
                    } catch (err) {
                        console.error("Failed to delete player", err);
                        alert("Failed to delete player — check console");
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

                        // onSave payload — was: values.currentTeam ? Number(values.currentTeam) : null
                        const payload = {
                            firstName: values.firstName,
                            lastName: values.lastName,
                            currentTeam:
                                values.currentTeam && values.currentTeam !== "none" ? Number(values.currentTeam) : null,
                        };

                        try {
                            const res = editing.id
                                ? await fetch(`/api/players/${editing.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload),
                                })
                                : await fetch("/api/players", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload),
                                });

                            if (!res.ok) {
                                const body = await res.json().catch(() => ({}));
                                alert(body.error ?? "Failed to save player");
                                return;
                            }

                            fetchPlayers();
                            setEditing(null);
                        } catch (err) {
                            console.error("Failed to save player", err);
                            alert("Failed to save player — check console");
                        }
                    }}
                />
            )}
        </>
    );
}
