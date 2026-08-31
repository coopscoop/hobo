"use client";

import { useState } from "react";
import { CELL_BADGE_STYLE, buildInningsArray, computePlayerTotals, paLabel } from "@/lib/types/constants";
import type { TeamGameData, TeamKey } from "@/lib/types/types";

interface Props {
    teamKey: TeamKey;
    team: TeamGameData;
    maxInning: number;
    disabledPlayers: Set<string>;
    onOpenCell: (playerId: string, inning: number) => void;
    onReorderPlayers: (orderedPlayerIds: string[]) => void;
    onToggleDisabled: (playerId: string) => void;
    onRemoveSubstitute: (playerId: string, subId: number) => void;
}

export function ScorecardTeam({ teamKey, team, maxInning, disabledPlayers, onOpenCell, onReorderPlayers, onToggleDisabled, onRemoveSubstitute }: Props) {
    const innings = buildInningsArray(maxInning);
    const [dragId, setDragId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);

    function handleDrop(targetId: string) {
        if (!dragId || dragId === targetId) {
            setDragId(null);
            setOverId(null);
            return;
        }
        const ids = team.players.map((p) => p.playerId);
        const fromIndex = ids.indexOf(dragId);
        const toIndex = ids.indexOf(targetId);
        ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, dragId);
        onReorderPlayers(ids);
        setDragId(null);
        setOverId(null);
    }

return (
    <section className="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-sm">
      {/* header unchanged */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800/60 text-neutral-400">
              <th className="w-10 px-1 py-2">Present</th>
              <th className="sticky left-0 z-10 min-w-[140px] bg-neutral-800/60 px-3 py-2 text-left font-medium">Player</th>
              {innings.map((i) => (
                <th key={i} className="w-16 px-1 py-2 text-center font-medium">{i}</th>
              ))}
              <th className="w-12 px-1 py-2 text-center font-medium">AB</th>
              <th className="w-12 px-1 py-2 text-center font-medium">H</th>
              <th className="w-12 px-1 py-2 text-center font-medium">R</th>
              <th className="w-14 px-1 py-2 text-center font-medium">RBI</th>
            </tr>
          </thead>
          <tbody>
            {team.players.map((player) => {
              const totals = computePlayerTotals(player);
              const isDisabled = disabledPlayers.has(player.playerId);
              const isDragging = dragId === player.playerId;
              const isOver = overId === player.playerId && dragId !== player.playerId;
              return (
                <tr
                  key={player.playerId}
                  draggable
                  onDragStart={() => setDragId(player.playerId)}
                  onDragOver={(e) => { e.preventDefault(); if (overId !== player.playerId) setOverId(player.playerId); }}
                  onDrop={(e) => { e.preventDefault(); handleDrop(player.playerId); }}
                  onDragEnd={() => { setDragId(null); setOverId(null); }}
                  className={`cursor-grab border-b border-neutral-800 hover:bg-neutral-800/40 ${
                    isDragging ? "opacity-40" : ""
                  } ${isOver ? "border-t-2 border-t-neutral-400" : ""} ${isDisabled ? "opacity-40" : ""}`}
                >
                  <td className="px-1 py-1 text-center">
                    {player.isSubstitute ? (
                      <button
                        onClick={() => onRemoveSubstitute(player.playerId, player.subId!)}
                        title="Remove substitute"
                        className="text-neutral-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    ) : (
                      <input
                        type="checkbox"
                        checked={!isDisabled}
                        onChange={() => onToggleDisabled(player.playerId)}
                        title={isDisabled ? "Not present — click to include" : "Present — click to exclude"}
                      />
                    )}
                  </td>
                  <td className="sticky left-0 z-10 bg-neutral-900 px-3 py-1.5 font-medium text-neutral-200">
                    <span className="mr-1 select-none text-neutral-500">⠿</span>
                    {player.name}
                    {player.isSubstitute && (
                      <span className="ml-1.5 rounded bg-neutral-700 px-1 text-[10px] font-normal text-neutral-300">SUB</span>
                    )}
                  </td>
                  {innings.map((inning) => {
                    const pas = player.innings[inning] ?? [];
                    return (
                      <td key={inning} className="px-1 py-1 text-center">
                        <button
                          onClick={() => !isDisabled && onOpenCell(player.playerId, inning)}
                          disabled={isDisabled}
                          className="flex h-9 w-full min-w-[3.2rem] flex-col items-center justify-center gap-0.5 rounded border border-neutral-700 bg-neutral-800/40 hover:border-neutral-500 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:hover:border-neutral-700 disabled:hover:bg-neutral-800/40"
                        >
                          {pas.length === 0 && <span className="text-neutral-600">·</span>}
                          {pas.map((pa, idx) =>
                            pa.result ? (
                              <span key={idx} className={`rounded px-1 text-[10px] font-semibold leading-tight ${CELL_BADGE_STYLE[pa.result]}`}>
                                {paLabel(pa)}{pa.scored ? " •" : ""}
                              </span>
                            ) : null
                          )}
                        </button>
                      </td>
                    );
                  })}
                  <td className="text-center text-neutral-300">{totals.ab}</td>
                  <td className="text-center text-neutral-300">{totals.h}</td>
                  <td className="text-center text-neutral-300">{totals.r}</td>
                  <td className="text-center text-neutral-300">{totals.rbi}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
