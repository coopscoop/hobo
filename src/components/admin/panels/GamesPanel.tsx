// src/components/admin/panels/GamesPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminEntityPanel from "@/components/admin/panels/AdminEntityPanel";
import FormEditModal, { FormFieldConfig } from "@/components/admin/FormEditModal";
import GamesEditModal from "@/components/admin/GamesEditModal";
import { GridColDef } from "@mui/x-data-grid";

interface GameRow {
    id: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    location: string | null;
}

interface Option {
    id: number;
    name: string;
}

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "date", headerName: "Date", width: 120 },
    { field: "homeTeam", headerName: "Home", flex: 1 },
    { field: "awayTeam", headerName: "Away", flex: 1 },
    { field: "location", headerName: "Location", width: 140 },
];

export default function GamesPanel() {
    const [rows, setRows] = useState<GameRow[]>([]);
    const [teams, setTeams] = useState<Option[]>([]);
    const [fields, setFields] = useState<Option[]>([]);
    const [creating, setCreating] = useState<any | null>(null);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);

    const fetchGames = () => {
        fetch("/api/games")
            .then((res) => res.json())
            .then((games: any[]) => {
                setRows(
                    games.map((g) => ({
                        id: g.id,
                        date: g.date,
                        homeTeam: g.homeTeam?.name ?? "",
                        awayTeam: g.awayTeam?.name ?? "",
                        location: g.location ?? "",
                    }))
                );
            })
            .catch((err) => console.error("Failed to load games", err));
    };

    useEffect(() => {
        fetchGames();

        fetch("/api/teams")
            .then((res) => res.json())
            .then((teams: any[]) => setTeams(teams.map((t) => ({ id: t.id, name: t.teamName }))))
            .catch((err) => console.error("Failed to load teams", err));

        fetch("/api/fields")
            .then((res) => res.json())
            .then(setFields)
            .catch((err) => console.error("Failed to load fields", err));
    }, []);

    const createFields: FormFieldConfig[] = useMemo(
        () => [
            {
                name: "homeTeamId",
                label: "Home Team",
                type: "select",
                options: teams.map((t) => ({ value: t.id, label: t.name })),
            },
            {
                name: "awayTeamId",
                label: "Away Team",
                type: "select",
                options: teams.map((t) => ({ value: t.id, label: t.name })),
            },
            {
                name: "fieldId",
                label: "Field",
                type: "select",
                options: fields.map((f) => ({ value: f.id, label: f.name })),
            },
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
                    setCreating({
                        homeTeamId: "",
                        awayTeamId: "",
                        fieldId: "",
                        date: new Date().toISOString().slice(0, 10),
                        time: "",
                    })
                }
                onEdit={(row) => setEditingGameId(String(row.id))}
                onDelete={async (row) => {
                    if (!confirm(`Delete game #${row.id} (${row.homeTeam} vs ${row.awayTeam})?`)) return;

                    try {
                        const res = await fetch(`/api/games/${row.id}`, { method: "DELETE" });
                        if (!res.ok) {
                            const body = await res.json().catch(() => ({}));
                            alert(body.error ?? "Failed to delete game");
                            return;
                        }
                        fetchGames();
                    } catch (err) {
                        console.error("Failed to delete game", err);
                        alert("Failed to delete game — check console");
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
                            const res = await fetch("/api/games", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    homeTeamId: Number(values.homeTeamId),
                                    awayTeamId: Number(values.awayTeamId),
                                    fieldId: Number(values.fieldId),
                                    date: values.date,
                                    ...(values.time && { time: values.time }),
                                }),
                            });
                            if (!res.ok) {
                                const body = await res.json().catch(() => ({}));
                                alert(body.error ?? "Failed to create game");
                                return;
                            }
                            const newGame = await res.json();
                            const homeTeam = teams.find((t) => t.id === Number(values.homeTeamId));
                            const awayTeam = teams.find((t) => t.id === Number(values.awayTeamId));
                            setRows((prev) => [
                                ...prev,
                                {
                                    id: newGame.id,
                                    date: newGame.date,
                                    homeTeam: homeTeam?.name ?? "",
                                    awayTeam: awayTeam?.name ?? "",
                                    location: newGame.location ?? "",
                                },
                            ]);
                            setCreating(null);
                            fetchGames();
                        } catch (err) {
                            console.error("Failed to create game", err);
                            alert("Failed to create game — check console");
                        }
                    }}
                />
            )}

            {editingGameId && <GamesEditModal open gameId={editingGameId} onClose={() => setEditingGameId(null)} />}
        </>
    );
}
