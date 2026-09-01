// src/components/admin/panels/GamesPanel.tsx
"use client";

import { useEffect, useState } from "react";
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

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "date", headerName: "Date", width: 120 },
    { field: "homeTeam", headerName: "Home", flex: 1 },
    { field: "awayTeam", headerName: "Away", flex: 1 },
    { field: "location", headerName: "Location", width: 140 },
];

const createFields: FormFieldConfig[] = [
    { name: "homeTeam", label: "Home Team" },
    { name: "awayTeam", label: "Away Team" },
    { name: "location", label: "Location" },
    { name: "date", label: "Date" },
];

export default function GamesPanel() {
    const [rows, setRows] = useState<GameRow[]>([]);
    const [creating, setCreating] = useState<any | null>(null);
    const [editingGameId, setEditingGameId] = useState<string | null>(null);

    useEffect(() => {
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
    }, []);

    return (
        <>
            <AdminEntityPanel
                title="Games"
                rows={rows}
                columns={columns}
                onAdd={() => setCreating({ homeTeam: "", awayTeam: "", field: "", date: "" })}
                onEdit={(row) => setEditingGameId(String(row.id))}
            />

            {creating && (
                <FormEditModal
                    open
                    title="Create Game"
                    fields={createFields}
                    initialValues={creating}
                    onClose={() => setCreating(null)}
                    onSave={async (values) => {
                        // TODO: POST to a games create endpoint once it exists
                        console.log("create game", values);
                        setCreating(null);
                    }}
                />
            )}

            {editingGameId && (
                <GamesEditModal open gameId={editingGameId} onClose={() => setEditingGameId(null)} />
            )}
        </>
    );
}
