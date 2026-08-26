"use client";

import { useState } from "react";
import { LineScore } from "@/components/games/LineScore";
import { ScorecardTeam } from "@/components/games/ScorecardTeam";
import { InningModal } from "@/components/games/InningModal";
import { AddSubstitute } from "@/components/games/AddSubstitute"
import { PlayerName } from "@/types/types"
import { DEFAULT_MAX_INNING, buildInningsArray, deriveInitialMaxInning, computePlayerTotals, emptyPA, isPAFilled, computeAutoRunsForInning } from "@/types/constants";

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
    const [maxInning, setMaxInning] = useState(() => deriveInitialMaxInning(initialTeams));
    const [disabledPlayers, setDisabledPlayers] = useState<Record<TeamKey, Set<string>>>({
        home: new Set(),
        away: new Set(),
    });

    function toggleDisabled(teamKey: TeamKey, playerId: string) {
        setDisabledPlayers((prev) => {
            const next = { ...prev, [teamKey]: new Set(prev[teamKey]) };
            if (next[teamKey].has(playerId)) next[teamKey].delete(playerId);
            else next[teamKey].add(playerId);
            return next;
        });
    }

    async function saveBattingRow(teamKey: TeamKey, playerId: string) {
        // disabled players never get a row pushed — this is the actual enforcement
        // point for "skip pushing 0-stat rows", not just a visual toggle
        if (disabledPlayers[teamKey].has(playerId)) return;
        const player = teams[teamKey].players.find((p) => p.playerId === playerId);
        if (!player) return;
        try {
            const res = await fetch(`/api/games/${gameId}/batting`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerId: Number(playerId), innings: player.innings }),
            });
            if (!res.ok) throw new Error(`save failed: ${res.status}`);
            flashSaved();
        } catch (err) {
            console.error("Failed to save batting row", err);
            // TODO: surface a real error state instead of failing silently — worth
            // revisiting once there's a UX pattern elsewhere in the app for this
        }
    }

    async function saveGameScore() {
        const innings = buildInningsArray(maxInning).map((inning) => ({
            inning,
            homeRuns: overrides.home[inning] ?? computeAutoRunsForInning(teams.home, inning),
            awayRuns: overrides.away[inning] ?? computeAutoRunsForInning(teams.away, inning),
        }));
        const homeScore = innings.reduce((sum, i) => sum + i.homeRuns, 0);
        const awayScore = innings.reduce((sum, i) => sum + i.awayRuns, 0);

        try {
            const res = await fetch(`/api/games/${gameId}/score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ innings, homeScore, awayScore }),
            });
            if (!res.ok) throw new Error(`save failed: ${res.status}`);
            flashSaved();
        } catch (err) {
            console.error("Failed to save game score", err);
            alert("Failed to save final score — check console");
        }
    }

    async function removeSubstitute(teamKey: TeamKey, playerId: string, subId: number) {
        try {
            const res = await fetch(`/api/games/${gameId}/substitutes/${subId}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`remove failed: ${res.status}`);
            setTeams((prev) => {
                const next = structuredClone(prev);
                next[teamKey].players = next[teamKey].players.filter((p) => p.playerId !== playerId);
                return next;
            });
        } catch (err) {
            console.error("Failed to remove substitute", err);
        }
    }

    function addInning() {
        setMaxInning((m) => m + 1);
    }

    function removeInning() {
        if (maxInning <= DEFAULT_MAX_INNING) return;
        const hasData = (Object.values(teams) as TeamGameData[]).some((team) =>
            team.players.some((p) => (p.innings[maxInning] ?? []).some(isPAFilled))
        );
        if (hasData) {
            alert(`Inning ${maxInning} has data entered — clear it before removing the inning.`);
            return;
        }
        setMaxInning((m) => m - 1);
    }

    // stub for auto saving
    function flashSaved() {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 900);
    }

    async function addSubstitute(teamKey: TeamKey, player: PlayerName) {
        try {
            const res = await fetch(`/api/games/${gameId}/substitutes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playerId: player.id, newTeamId: Number(teams[teamKey].teamId) }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                alert(body.error ?? "Failed to add substitute");
                return;
            }
            const sub = await res.json();
            setTeams((prev) => {
                const next = structuredClone(prev);
                next[teamKey].players.push({
                    playerId: String(player.id),
                    name: `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim(),
                    innings: {},
                    isSubstitute: true,
                    subId: sub.id,
                });
                return next;
            });
        } catch (err) {
            console.error("Failed to add substitute", err);
        }
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
    }

    function openCell(teamKey: TeamKey, playerId: string, inning: number) {
        if (getPAs(teamKey, playerId, inning).length === 0) {
            updatePA(teamKey, playerId, inning, 0, {});
        }
        setModal({ team: teamKey, playerId, inning });
    }

    function moveInning(direction: 1 | -1) {
        if (!modal) return;
        saveBattingRow(modal.team, modal.playerId);
        const nextInning = Math.min(maxInning, Math.max(1, modal.inning + direction));
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
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span>{maxInning} innings</span>
                        <button
                            onClick={removeInning}
                            disabled={maxInning <= DEFAULT_MAX_INNING}
                            className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-800 disabled:opacity-30"
                        >
                            −
                        </button>
                        <button
                            onClick={addInning}
                            className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-800"
                        >
                            + Extra Inning
                        </button>
                    </div>
                    <div className={`text-xs font-medium transition-opacity duration-500 ${savedFlash ? "opacity-100 text-emerald-400" : "opacity-0"}`}>
                        Saved
                    </div>
                    <button
                        onClick={saveGameScore}
                        className="rounded bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
                    >
                        Save Final Score
                    </button>
                </header>

                <LineScore
                    teams={teams}
                    overrides={overrides}
                    maxInning={maxInning}
                    onSetOverride={(teamKey, inning, value) => {
                        setOverrides((prev) => ({ ...prev, [teamKey]: { ...prev[teamKey], [inning]: value } }));
                    }}
                />

                <ScorecardTeam
                    teamKey="home"
                    team={teams.home}
                    maxInning={maxInning}
                    disabledPlayers={disabledPlayers.home}
                    onOpenCell={(playerId, inning) => openCell("home", playerId, inning)}
                    onReorderPlayers={(ids) => reorderPlayers("home", ids)}
                    onToggleDisabled={(playerId: string) => toggleDisabled("home", playerId)}
                    onRemoveSubstitute={(playerId: string, subId: number) => removeSubstitute("home", playerId, subId)}
                />
                <div className="px-1">
                    <AddSubstitute
                        excludePlayerIds={new Set(teams.home.players.map((p) => p.playerId))}
                        onAdd={(p) => addSubstitute("home", p)}
                    />
                </div>

                <ScorecardTeam
                    teamKey="away"
                    team={teams.away}
                    maxInning={maxInning}
                    disabledPlayers={disabledPlayers.away}
                    onOpenCell={(playerId, inning) => openCell("away", playerId, inning)}
                    onReorderPlayers={(ids) => reorderPlayers("away", ids)}
                    onToggleDisabled={(playerId: string) => toggleDisabled("away", playerId)}
                    onRemoveSubstitute={(playerId: string, subId: number) => removeSubstitute("away", playerId, subId)}
                />
                <div className="px-1">
                    <AddSubstitute
                        excludePlayerIds={new Set(teams.home.players.map((p) => p.playerId))}
                        onAdd={(p) => addSubstitute("home", p)}
                    />
                </div>
            </div>

            {modal && (
                <InningModal
                    target={modal}
                    playerName={teams[modal.team].players.find((p) => p.playerId === modal.playerId)!.name}
                    pas={getPAs(modal.team, modal.playerId, modal.inning)}
                    minInning={1}
                    maxInning={maxInning}
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
