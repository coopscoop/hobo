"use client";

import { useState } from "react";
import { LineScore } from "@/components/games/LineScore";
import { ScorecardTeam } from "@/components/games/ScorecardTeam";
import { InningModal } from "@/components/games/InningModal";
import { MAX_INNING, computePlayerTotals, emptyPA } from "@/types/constants";
import type {
    LineScoreOverrides,
    ModalTarget,
    PlateAppearance,
    TeamGameData,
    TeamKey,
} from "@/types/types";

interface Props {
    gameId: string;
    initialTeams: Record<TeamKey, TeamGameData>;
}

export default function EditGamePage({ gameId, initialTeams }: Props) {
    const [teams, setTeams] = useState<Record<TeamKey, TeamGameData>>(initialTeams);
    const [overrides, setOverrides] = useState<Record<TeamKey, LineScoreOverrides>>({ home: {}, away: {} });
    const [modal, setModal] = useState<ModalTarget | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);

    // stub for auto saving
    function flashSaved() {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 900);
    }

    // ---- persistence stubs -------------------------------------------------
    // TODO: real endpoints. Batting table needs a new jsonb column (e.g. `inning_data`)
    // to hold the raw per-inning PA array alongside the existing final-stat columns —
    // the two are allowed to disagree with the line score by design, per how the
    // rest of this schema already works.

    async function saveBattingRow(teamKey: TeamKey, playerId: string) {
        const player = teams[teamKey].players.find((p) => p.playerId === playerId);
        if (!player) return;
        const totals = computePlayerTotals(player);
        // await fetch(`/api/games/${gameId}/batting`, {
        //   method: "POST",
        //   body: JSON.stringify({ playerId, gameId, totals, inningData: player.innings }),
        // });
        flashSaved();
    }

    async function saveLineScoreCell(teamKey: TeamKey, inning: number, value: number | undefined) {
        // await fetch(`/api/games/${gameId}/line-score`, {
        //   method: "POST",
        //   body: JSON.stringify({ gameId, teamKey, inning, value }),
        // });
        flashSaved();
    }

    async function savePlayerOrder(teamKey: TeamKey, orderedPlayerIds: string[]) {
        // await fetch(`/api/games/${gameId}/lineup`, {
        //   method: "POST",
        //   body: JSON.stringify({ gameId, teamKey, orderedPlayerIds }),
        // });
        flashSaved();
    }

    // ---- batting grid state mutations --------------------------------------

    function getPAs(teamKey: TeamKey, playerId: string, inning: number): PlateAppearance[] {
        const player = teams[teamKey].players.find((p) => p.playerId === playerId);
        return player?.innings[inning] ?? [];
    }

    function updatePA(teamKey: TeamKey, playerId: string, inning: number, paIndex: number, patch: Partial<PlateAppearance>) {
        setTeams((prev) => {
            const next = structuredClone(prev);
            const player = next[teamKey].players.find((p) => p.playerId === playerId)!;
            const pas = player.innings[inning] ?? [emptyPA()];
            pas[paIndex] = { ...pas[paIndex], ...patch };
            player.innings[inning] = pas;
            return next;
        });
    }

    function addSecondPA(teamKey: TeamKey, playerId: string, inning: number, restore?: PlateAppearance) {
        setTeams((prev) => {
            const next = structuredClone(prev);
            const player = next[teamKey].players.find((p) => p.playerId === playerId)!;
            const pas = player.innings[inning] ?? [emptyPA()];
            if (pas.length < 2) pas.push(restore ?? emptyPA());
            player.innings[inning] = pas;
            return next;
        });
    }

    function removeSecondPA(teamKey: TeamKey, playerId: string, inning: number): PlateAppearance | null {
        let removed: PlateAppearance | null = null;
        setTeams((prev) => {
            const next = structuredClone(prev);
            const player = next[teamKey].players.find((p) => p.playerId === playerId)!;
            const pas = player.innings[inning] ?? [];
            if (pas.length === 2) removed = pas.pop()!;
            player.innings[inning] = pas;
            return next;
        });
        return removed;
    }

    function reorderPlayers(teamKey: TeamKey, orderedPlayerIds: string[]) {
        setTeams((prev) => {
            const next = structuredClone(prev);
            const byId = new Map(next[teamKey].players.map((p) => [p.playerId, p]));
            next[teamKey].players = orderedPlayerIds.map((id) => byId.get(id)!);
            return next;
        });
        savePlayerOrder(teamKey, orderedPlayerIds);
    }

    function openCell(teamKey: TeamKey, playerId: string, inning: number) {
        if (getPAs(teamKey, playerId, inning).length === 0) {
            updatePA(teamKey, playerId, inning, 0, {});
        }
        setModal({ team: teamKey, playerId, inning });
    }

    function moveInning(direction: 1 | -1) {
        if (!modal) return;
        saveBattingRow(modal.team, modal.playerId); // persist the inning we're leaving
        const nextInning = Math.min(MAX_INNING, Math.max(1, modal.inning + direction));
        if (getPAs(modal.team, modal.playerId, nextInning).length === 0) {
            updatePA(modal.team, modal.playerId, nextInning, 0, {});
        }
        setModal({ ...modal, inning: nextInning });
    }

    function closeModal() {
        if (modal) saveBattingRow(modal.team, modal.playerId);
        setModal(null);
    }

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="flex items-center justify-between border-b-4 border-neutral-700 pb-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Game Data Entry</h1>
                        <p className="text-sm text-neutral-400">
                            {teams.home.name} vs {teams.away.name}
                        </p>
                    </div>
                    <div className={`text-xs font-medium transition-opacity duration-500 ${savedFlash ? "opacity-100 text-emerald-400" : "opacity-0"}`}>
                        Saved
                    </div>
                </header>

                <LineScore
                    teams={teams}
                    overrides={overrides}
                    onSetOverride={(teamKey, inning, value) => {
                        setOverrides((prev) => ({ ...prev, [teamKey]: { ...prev[teamKey], [inning]: value } }));
                        saveLineScoreCell(teamKey, inning, value);
                    }}
                />

                <ScorecardTeam
                    teamKey="home"
                    team={teams.home}
                    onOpenCell={(playerId, inning) => openCell("home", playerId, inning)}
                    onReorderPlayers={(ids) => reorderPlayers("home", ids)}
                />
                <ScorecardTeam
                    teamKey="away"
                    team={teams.away}
                    onOpenCell={(playerId, inning) => openCell("away", playerId, inning)}
                    onReorderPlayers={(ids) => reorderPlayers("away", ids)}
                />
            </div>

            {modal && (
                <InningModal
                    target={modal}
                    playerName={teams[modal.team].players.find((p) => p.playerId === modal.playerId)!.name}
                    pas={getPAs(modal.team, modal.playerId, modal.inning)}
                    minInning={1}
                    maxInning={MAX_INNING}
                    onChangePA={(paIndex, patch) => updatePA(modal.team, modal.playerId, modal.inning, paIndex, patch)}
                    onAddSecondPA={(restore) => addSecondPA(modal.team, modal.playerId, modal.inning, restore)}
                    onRemoveSecondPA={() => removeSecondPA(modal.team, modal.playerId, modal.inning)}
                    onMoveInning={moveInning}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}
