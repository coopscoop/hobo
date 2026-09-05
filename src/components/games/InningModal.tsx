// src/components/games/InningModal.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { AtBatFields } from "@/components/games/AtBatFields";
import { emptyPA } from "@/lib/constants";
import type { ModalTarget, PlateAppearance } from "@/lib/types";

interface Props {
    target: ModalTarget;
    playerName: string;
    pas: PlateAppearance[];
    minInning: number;
    maxInning: number;
    onChangePA: (paIndex: number, patch: Partial<PlateAppearance>) => void;
    onAddSecondPA: (restore?: PlateAppearance) => void;
    onRemoveSecondPA: () => PlateAppearance | null;
    onClearInning: () => void;
    onMoveInning: (direction: 1 | -1) => void;
    onClose: () => void;
}

export function InningModal({
    target,
    playerName,
    pas,
    minInning,
    maxInning,
    onChangePA,
    onAddSecondPA,
    onRemoveSecondPA,
    onClearInning,
    onMoveInning,
    onClose,
}: Props) {
    const [justRemoved, setJustRemoved] = useState<PlateAppearance | null>(null);

    function handleRemove() {
        const removed = onRemoveSecondPA();
        setJustRemoved(removed);
        setTimeout(() => setJustRemoved(null), 5000);
    }

    function handleUndo() {
        if (!justRemoved) return;
        onAddSecondPA(justRemoved);
        setJustRemoved(null);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-gray-200 bg-red-600 px-4 py-3 text-white">
                    <button
                        onClick={() => onMoveInning(-1)}
                        disabled={target.inning <= minInning}
                        className="disabled:opacity-30"
                        aria-label="Previous inning"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center">
                        <div className="text-sm font-semibold">{playerName}</div>
                        <div className="text-xs text-red-100">Inning {target.inning}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onMoveInning(1)}
                            disabled={target.inning >= maxInning}
                            className="disabled:opacity-30"
                            aria-label="Next inning"
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button onClick={onClose} className="ml-1 text-red-100 hover:text-white" aria-label="Close">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-3 px-5 py-4">
                    <AtBatFields
                        label="At-bat 1"
                        pa={pas[0] ?? emptyPA()}
                        onChange={(patch) => onChangePA(0, patch)}
                    />

                    {pas.length > 1 ? (
                        <AtBatFields
                            label="At-bat 2"
                            pa={pas[1]}
                            onChange={(patch) => onChangePA(1, patch)}
                            onRemove={handleRemove}
                        />
                    ) : justRemoved ? (
                        <div className="flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500">
                            <span>At-bat 2 removed</span>
                            <button onClick={handleUndo} className="font-semibold text-gray-800 hover:underline">
                                Undo
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAddSecondPA()}
                            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 hover:border-red-400 hover:text-red-600"
                        >
                            <Plus size={14} /> Add 2nd at-bat this inning
                        </button>
                    )}
                </div>

                <div className="sticky bottom-0 rounded-b-xl border-t border-gray-200 bg-gray-50 px-5 py-3 text-right">
                    <button
                        onClick={onClearInning}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900 px-4 mx-4"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onClose}
                        className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
