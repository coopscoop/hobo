import type { PlateAppearance, PlayerGameData, PlayerTotals, ResultCode, ResultGroup, TeamGameData, InningMap, TeamKey, BattingRow } from "./types";
export const DEFAULT_MAX_INNING = 9; // extra innings derrive from game data but playoffs can go >9 so handle the edge case but treat 9 as a default

export function buildInningsArray(maxInning: number): number[] {
  return Array.from({ length: maxInning }, (_, i) => i + 1);
}

/** Scans existing per-player inning data for the highest inning number present,
 *  so a resumed 11-inning game reopens at 11 instead of snapping back to 9. */
export function deriveInitialMaxInning(teams: Record<TeamKey, TeamGameData>): number {
  let highest = DEFAULT_MAX_INNING;
  for (const team of Object.values(teams)) {
    for (const player of team.players) {
      for (const inningKey of Object.keys(player.innings)) {
        highest = Math.max(highest, Number(inningKey));
      }
    }
  }
  return highest;
}

export const RESULTS: { code: ResultCode; label: string; group: ResultGroup }[] = [
  { code: "OUT", label: "Out", group: "out" },
  { code: "K", label: "Strikeout", group: "out" },
  { code: "BB", label: "Walk", group: "reach" },
  { code: "HBP", label: "HBP", group: "reach" },
  { code: "1B", label: "Single", group: "hit" },
  { code: "2B", label: "Double", group: "hit" },
  { code: "3B", label: "Triple", group: "hit" },
  { code: "HR", label: "Home Run", group: "homer" },
];

// Dark-theme chip styling per result group — the one place color-coding lives.
// Everything else in the UI stays neutral slate/grey per current direction.
export const RESULT_CHIP_STYLE: Record<ResultGroup, string> = {
  out: "border-neutral-600 text-neutral-300 data-[on=true]:bg-neutral-500 data-[on=true]:text-white data-[on=true]:border-neutral-500",
  reach:
    "border-amber-700 text-amber-400 data-[on=true]:bg-amber-500 data-[on=true]:text-neutral-950 data-[on=true]:border-amber-500",
  hit: "border-emerald-700 text-emerald-400 data-[on=true]:bg-emerald-600 data-[on=true]:text-white data-[on=true]:border-emerald-600",
  homer:
    "border-indigo-700 text-indigo-400 data-[on=true]:bg-indigo-600 data-[on=true]:text-white data-[on=true]:border-indigo-600",
};

export const CELL_BADGE_STYLE: Record<ResultCode, string> = {
  OUT: "bg-neutral-800 text-neutral-400",
  K: "bg-neutral-700 text-neutral-200",
  BB: "bg-amber-900/50 text-amber-300",
  HBP: "bg-amber-900/50 text-amber-300",
  "1B": "bg-emerald-900/50 text-emerald-300",
  "2B": "bg-emerald-900/50 text-emerald-300",
  "3B": "bg-emerald-900/50 text-emerald-300",
  HR: "bg-indigo-600 text-white",
};

export function emptyPA(): PlateAppearance {
  return { result: null, sac: false, fc: false, rbi: 0, sb2: false, sb3: false, sbHome: false, scored: false };
}

export function isPAFilled(pa: PlateAppearance): boolean {
  return pa.result !== null;
}

export function paLabel(pa: PlateAppearance): string | null {
  if (!pa.result) return null;
  let label: string = pa.result;
  if (pa.sac) label += " SAC";
  if (pa.fc) label += " FC";
  return label;
}

export function isAB(pa: PlateAppearance): boolean {
  if (!pa.result) return false;
  if (pa.result === "BB" || pa.result === "HBP") return false;
  if (pa.sac || pa.fc) return false;
  return true;
}

export function isHit(pa: PlateAppearance): boolean {
  return pa.result === "1B" || pa.result === "2B" || pa.result === "3B" || pa.result === "HR";
}

export function computePlayerTotals(player: PlayerGameData): PlayerTotals {
  const t: PlayerTotals = { ab: 0, h: 0, r: 0, rbi: 0, bb: 0, k: 0, sb: 0 };
  for (const pas of Object.values(player.innings)) {
    for (const pa of pas) {
      if (isAB(pa)) t.ab += 1;
      if (isHit(pa)) t.h += 1;
      if (pa.result === "BB") t.bb += 1;
      if (pa.result === "K") t.k += 1;
      if (pa.scored) t.r += 1;
      t.rbi += pa.rbi;
      t.sb += (pa.sb2 ? 1 : 0) + (pa.sb3 ? 1 : 0) + (pa.sbHome ? 1 : 0);
    }
  }
  return t;
}

export function computeAutoRunsForInning(team: TeamGameData, inning: number): number {
  let runs = 0;
  for (const player of team.players) {
    for (const pa of player.innings[inning] ?? []) {
      if (pa.scored) runs += 1;
    }
  }
  return runs;
}

/** Full DB-column-shaped aggregate from a player's raw per-inning PA data.
 *  Used both for the batting write endpoint and, if needed later, for
 *  recomputing display totals from persisted perInning data. */
export function computeBattingRow(innings: InningMap): BattingRow {
  const row: BattingRow = {
    atBat: 0, run: 0, walk: 0, strikeout: 0, hitByPitch: 0,
    stolenBase: 0, runsBattedIn: 0, sacrifice: 0,
    singleHit: 0, doubleHit: 0, tripleHit: 0, homeRun: 0,
  };
  for (const pas of Object.values(innings)) {
    for (const pa of pas) {
      if (isAB(pa)) row.atBat += 1;
      if (pa.scored) row.run += 1;
      if (pa.result === "BB") row.walk += 1;
      if (pa.result === "K") row.strikeout += 1;
      if (pa.result === "HBP") row.hitByPitch += 1;
      if (pa.result === "1B") row.singleHit += 1;
      if (pa.result === "2B") row.doubleHit += 1;
      if (pa.result === "3B") row.tripleHit += 1;
      if (pa.result === "HR") row.homeRun += 1;
      if (pa.sac) row.sacrifice += 1;
      row.runsBattedIn += pa.rbi;
      row.stolenBase += (pa.sb2 ? 1 : 0) + (pa.sb3 ? 1 : 0) + (pa.sbHome ? 1 : 0);
    }
  }
  return row;
}
