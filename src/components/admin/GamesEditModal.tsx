// app/admin/components/GamesEditModal.tsx
"use client";

import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";
import EditModal from "@/components/admin/EditModal";
import EditGamePage from "@/components/games/EditGamePage";
import { getGameEditData } from "@/lib/services/games";
import type { TeamKey, TeamGameData } from "@/lib/types";

interface GamesEditModalProps {
  open: boolean;
  gameId: string | null;
  onClose: () => void;
}

export default function GamesEditModal({ open, gameId, onClose }: GamesEditModalProps) {
  const [teams, setTeams] = useState<Record<TeamKey, TeamGameData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !gameId) {
      setTeams(null);
      setError(null);
      return;
    }
    let cancelled = false;
    getGameEditData(gameId)
      .then((data) => {
        if (!cancelled) setTeams(data.teams);
      })
      .catch((err) => {
        console.error("Failed to load game edit data", err);
        if (!cancelled) setError("Failed to load game data");
      });
    return () => {
      cancelled = true;
    };
  }, [open, gameId]);

  return (
    <EditModal open={open} title={`Edit Game #${gameId ?? ""}`} onClose={onClose} fullScreen hideFooter>
      {error && <Box sx={{ p: 4 }}>{error}</Box>}
      {!error && !teams && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {teams && gameId && (
        <EditGamePage gameId={gameId} initialTeams={teams} onSaved={onClose} />
      )}
    </EditModal>
  );
}
