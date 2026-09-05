// src/components/admin/panels/GamesPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import GamesEditModal from "@/components/admin/GamesEditModal";
import { GridColDef } from "@mui/x-data-grid";
import { createGame, deleteGame } from "@/lib/services/games";

interface Props {
    initialData: any[];
    teams: any[];
    fields: any[];
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "homeTeam", headerName: "Home", flex: 1 },
    { field: "awayTeam", headerName: "Away", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
];

export default function GamesPanel({ initialData, teams, fields }: Props) {
    const router = useRouter();
    const [creating, setCreating] = useState<any | null>(null);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);

    const rows = useMemo(
        () =>
            initialData.map((g) => ({
                id: g.id,
                date: g.date,
                homeTeam: g.homeTeam?.name ?? "",
                awayTeam: g.awayTeam?.name ?? "",
                location: g.fieldName ?? "",
            })),
        [initialData]
    );

    const createFields: FormFieldConfig[] = useMemo(
        () => [
            { name: "homeTeamId", label: "Home Team", type: "select", options: teams.map((t) => ({ value: t.id, label: t.teamName })) },
            { name: "awayTeamId", label: "Away Team", type: "select", options: teams.map((t) => ({ value: t.id, label: t.teamName })) },
            { name: "fieldId", label: "Field", type: "select", options: fields.map((f) => ({ value: f.id, label: f.name })) },
            { name: "date", label: "Date", type: "date" },
            { name: "time", label: "Time", type: "time" },
        ],
        [teams, fields]
    );

    return (
        <>
            <AdminEntityPanel
                title="Games"
                rows={rows}
                columns={columns}
                onAdd={() =>
                    setCreating({ homeTeamId: "", awayTeamId: "", fieldId: "", date: new Date().toISOString().slice(0, 10), time: "" })
                }
                onEdit={(row) => setEditingGameId(String(row.id))}
                onDelete={async (row) => {
                    if (!confirm(`Delete game #${row.id} (${row.homeTeam} vs ${row.awayTeam})?`)) return;
                    try {
                        await deleteGame(row.id);
                        router.refresh();
                    } catch (err: any) {
                        console.error("Failed to delete game", err);
                        alert(err.message ?? "Failed to delete game");
                    }
                }}
            />

            {creating && (
                <FormEditModal
                    open
                    title="Create Game"
                    fields={createFields}
                    initialValues={creating}
                    onClose={() => setCreating(null)}
                    onSave={async (values) => {
                        if (!values.homeTeamId || !values.awayTeamId || !values.fieldId || !values.date) {
                            alert("Home team, away team, field, and date are all required");
                            return;
                        }
                        if (values.homeTeamId === values.awayTeamId) {
                            alert("Home and away team must be different");
                            return;
                        }
                        try {
                            await createGame({
                                homeTeamId: Number(values.homeTeamId),
                                awayTeamId: Number(values.awayTeamId),
                                fieldId: Number(values.fieldId),
                                date: values.date,
                                ...(values.time && { time: values.time }),
                            });
                            router.refresh();
                            setCreating(null);
                        } catch (err: any) {
                            console.error("Failed to create game", err);
                            alert(err.message ?? "Failed to create game");
                        }
                    }}
                />
            )}

            {editingGameId && (
                <GamesEditModal
                    open
                    gameId={editingGameId}
                    onClose={() => {
                        setEditingGameId(null);
                        router.refresh(); // scorecard saves happen inside the modal itself; refresh admin list on close in case anything display-relevant changed
                    }}
                />
            )}
        </>
    );
}
