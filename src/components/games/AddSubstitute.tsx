"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { PlayerName } from "@/lib/types";
import { fetchPlayers } from "@/lib/services/players";

interface Props {
  excludePlayerIds: Set<string>;
  onAdd: (player: PlayerName) => void;
}

export function AddSubstitute({ excludePlayerIds, onAdd }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [players, setPlayers] = useState<PlayerName[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || players !== null) return;
        setLoading(true);
        fetchPlayers()
            .then((data: PlayerName[]) => setPlayers(data))
            .catch((err) => console.error("Failed to load players", err))
            .finally(() => setLoading(false));
    }, [open, players]);

    const filtered = useMemo(() => {
        if (!players) return [];
        const q = query.trim().toLowerCase();
        return players
            .filter((p) => !excludePlayerIds.has(String(p.id)))
            .filter((p) => {
                if (!q) return true;
                const full = `${p.firstName ?? ""} ${p.lastName ?? ""}`.toLowerCase();
                return full.includes(q);
            })
            .slice(0, 25);
    }, [players, query, excludePlayerIds]);

    function pick(p: PlayerName) {
        onAdd(p);
        setOpen(false);
        setQuery("");
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 rounded border border-dashed border-gray-300 px-2 py-1 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-600"
            >
                <Plus size={12} /> Add substitute
            </button>
        );
    }

    return (
        <div className="relative">
            <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Search players…"
                className="w-56 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
            />
            {open && (
                <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-64 overflow-y-auto rounded border border-gray-200 bg-white shadow-xl">
                    {loading && <div className="px-3 py-2 text-xs text-gray-500">Loading…</div>}
                    {!loading && filtered.length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-500">No matches</div>
                    )}
                    {filtered.map((p) => (
                        <button
                            key={p.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pick(p)}
                            className="block w-full px-3 py-1.5 text-left text-xs text-gray-800 hover:bg-gray-50"
                        >
                            {p.firstName} {p.lastName}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
