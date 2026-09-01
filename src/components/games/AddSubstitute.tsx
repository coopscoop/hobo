"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { PlayerName } from "@/lib/types";

interface Props {
  excludePlayerIds: Set<string>; // current team's roster + already-added subs — filtered client-side only, backend enforces the real rule
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
    fetch("/api/players")
      .then((r) => r.json())
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
      .slice(0, 25); // long list, cap results rather than rendering everyone on each keystroke
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
        className="flex items-center gap-1 rounded border border-dashed border-neutral-600 px-2 py-1 text-xs font-medium text-neutral-400 hover:border-neutral-400 hover:text-neutral-200"
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
        onBlur={() => setTimeout(() => setOpen(false), 150)} // delay so the click on a result registers first
        placeholder="Search players…"
        className="w-56 rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-100"
      />
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-64 overflow-y-auto rounded border border-neutral-700 bg-neutral-900 shadow-xl">
          {loading && <div className="px-3 py-2 text-xs text-neutral-500">Loading…</div>}
          {!loading && filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-neutral-500">No matches</div>
          )}
          {filtered.map((p) => (
            <button
              key={p.id}
              onMouseDown={(e) => e.preventDefault()} // fire before the input's onBlur closes the list
              onClick={() => pick(p)}
              className="block w-full px-3 py-1.5 text-left text-xs text-neutral-200 hover:bg-neutral-800"
            >
              {p.firstName} {p.lastName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
