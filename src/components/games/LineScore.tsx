// src/components/games/LineScore.tsx
"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { buildInningsArray, computeAutoRunsForInning } from "@/lib/constants";
import type { LineScoreOverrides, TeamGameData, TeamKey } from "@/lib/types";

interface Props {
    teams: Record<TeamKey, TeamGameData>;
    overrides: Record<TeamKey, LineScoreOverrides>;
    maxInning: number;
    onSetOverride: (team: TeamKey, inning: number, value: number | undefined) => void;
}

export function LineScore({ teams, overrides, maxInning, onSetOverride }: Props) {
    const innings = buildInningsArray(maxInning);
    const [editing, setEditing] = useState<{ team: TeamKey; inning: number } | null>(null);

    function valueFor(teamKey: TeamKey, inning: number): number {
        const override = overrides[teamKey][inning];
        return override !== undefined ? override : computeAutoRunsForInning(teams[teamKey], inning);
    }

    return (
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="bg-red-600 px-4 py-2">
                <h2 className="text-sm font-semibold text-white">Line Score</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                            <th className="sticky left-0 z-10 min-w-[140px] bg-gray-50 px-3 py-2 text-left font-medium">
                                Team
                            </th>
                            {innings.map((i) => (
                                <th key={i} className="w-14 px-1 py-2 text-center font-medium">
                                    {i}
                                </th>
                            ))}
                            <th className="w-16 px-1 py-2 text-center font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Object.keys(teams) as TeamKey[]).map((teamKey) => {
                            const values = innings.map((inning) => valueFor(teamKey, inning));
                            return (
                                <tr key={teamKey} className="border-b border-gray-100 last:border-b-0">
                                    <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium text-gray-900">
                                        {teams[teamKey].name}
                                    </td>
                                    {innings.map((inning, idx) => {
                                        const isOverridden = overrides[teamKey][inning] !== undefined;
                                        const isEditing = editing?.team === teamKey && editing?.inning === inning;
                                        const value = values[idx];
                                        return (
                                            <td key={inning} className="px-1 py-1 text-center">
                                                {isEditing ? (
                                                    <input
                                                        autoFocus
                                                        type="number"
                                                        min={0}
                                                        defaultValue={value}
                                                        onFocus={(e) => e.target.select()}
                                                        onBlur={(e) => {
                                                            const raw = e.target.value;
                                                            onSetOverride(teamKey, inning, raw === "" ? undefined : Number(raw));
                                                            setEditing(null);
                                                        }}
                                                        className="w-10 rounded border border-gray-400 bg-white text-center text-sm text-gray-900"
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => setEditing({ team: teamKey, inning })}
                                                        className={`group inline-flex w-10 items-center justify-center gap-0.5 rounded px-1 py-0.5 text-sm font-semibold ${isOverridden ? "bg-amber-100 text-amber-700" : "text-gray-800"
                                                            }`}
                                                        title={isOverridden ? "Manually set — locked to this value" : "Auto-filled — click to edit"}
                                                    >
                                                        {value}
                                                        <Pencil size={10} className="opacity-0 group-hover:opacity-60" />
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="text-center text-sm font-bold text-gray-900">
                                        {values.reduce((a, b) => a + b, 0)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
                Auto-filled from batter entries below. Click a cell to set it manually — once edited it stays as entered even
                if the batter data changes later.
            </p>
        </section>
    );
}
