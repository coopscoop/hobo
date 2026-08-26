"use client";

import { useState } from "react";
import { CELL_BADGE_STYLE, buildInningsArray, computePlayerTotals, paLabel } from "@/types/constants";
import type { TeamGameData, TeamKey } from "@/types/types";

interface Props {
  teamKey: TeamKey;
  team: TeamGameData;
  maxInning: number;
  onOpenCell: (playerId: string, inning: number) => void;
  onReorderPlayers: (orderedPlayerIds: string[]) => void;
}

export function ScorecardTeam({ teamKey, team, maxInning, onOpenCell, onReorderPlayers }: Props) {
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
      <div className="flex items-center justify-between bg-neutral-800 px-4 py-2">
        <h2 className="text-sm font-semibold text-neutral-100">{team.name}</h2>
        <span className="text-xs text-neutral-400">Drag rows to match scoresheet order</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800/60 text-neutral-400">
              <th className="sticky left-0 z-10 min-w-[140px] bg-neutral-800/60 px-3 py-2 text-left font-medium">
                Player
              </th>
              {innings.map((i) => (
                <th key={i} className="w-16 px-1 py-2 text-center font-medium">
                  {i}
                </th>
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
              const isDragging = dragId === player.playerId;
              const isOver = overId === player.playerId && dragId !== player.playerId;
              return (
                <tr
                  key={player.playerId}
                  draggable
                  onDragStart={() => setDragId(player.playerId)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overId !== player.playerId) setOverId(player.playerId);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(player.playerId);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  className={`cursor-grab border-b border-neutral-800 hover:bg-neutral-800/40 ${
                    isDragging ? "opacity-40" : ""
                  } ${isOver ? "border-t-2 border-t-neutral-400" : ""}`}
                >
                  <td className="sticky left-0 z-10 bg-neutral-900 px-3 py-1.5 font-medium text-neutral-200">
                    <span className="mr-1 select-none text-neutral-500">⠿</span>
                    {player.name}
                  </td>
                  {innings.map((inning) => {
                    const pas = player.innings[inning] ?? [];
                    return (
                      <td key={inning} className="px-1 py-1 text-center">
                        <button
                          onClick={() => onOpenCell(player.playerId, inning)}
                          className="flex h-9 w-full min-w-[3.2rem] flex-col items-center justify-center gap-0.5 rounded border border-neutral-700 bg-neutral-800/40 hover:border-neutral-500 hover:bg-neutral-800"
                        >
                          {pas.length === 0 && <span className="text-neutral-600">·</span>}
                          {pas.map((pa, idx) =>
                            pa.result ? (
                              <span
                                key={idx}
                                className={`rounded px-1 text-[10px] font-semibold leading-tight ${CELL_BADGE_STYLE[pa.result]}`}
                              >
                                {paLabel(pa)}
                                {pa.scored ? " •" : ""}
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
