import { InferSelectModel } from "drizzle-orm";
import { announcements, games, batting, innings } from "@/db/schema";
import { getGames, getGameById } from '@/db/queries/games';
import { getPlayers, getPlayerById, getPlayerGameLog } from '@/db/queries/players';
import { getTeams, getTeamById } from '@/db/queries/teams';
import { executives } from '@/db/schema';

// ---- Mirrors the schema ----
export type Announcement = InferSelectModel<typeof announcements>;
export type Game = InferSelectModel<typeof games>;
export type Batting = InferSelectModel<typeof batting>;
export type Inning = InferSelectModel<typeof innings>;
export type Executive = InferSelectModel<typeof executives>;

// ---- Custom types ----
export type GameListItem = Awaited<ReturnType<typeof getGames>>[number];
export type GameDetail = Awaited<ReturnType<typeof getGameById>>;
export type PlayerWithStats = Awaited<ReturnType<typeof getPlayers>>[number];
export type PlayerById = Awaited<ReturnType<typeof getPlayerById>>;
export type PlayerGameLog = Awaited<ReturnType<typeof getPlayerGameLog>>;
export type Team = Awaited<ReturnType<typeof getTeams>>[number];
export type TeamDetail = Awaited<ReturnType<typeof getTeamById>>;
export type Player = Awaited<ReturnType<typeof getPlayers>>[number];

// ---- Score Sheet types ----
export type ResultCode = "OUT" | "K" | "BB" | "HBP" | "1B" | "2B" | "3B" | "HR";

export type ResultGroup = "out" | "reach" | "hit" | "homer";

export interface PlateAppearance {
  result: ResultCode | null;
  sac: boolean;
  fc: boolean;
  rbi: 0 | 1 | 2 | 3 | 4;
  sb2: boolean;
  sb3: boolean;
  sbHome: boolean;
  scored: boolean;
}

/** Keyed by inning number (1-9+), not array index, so gaps and extra innings are cheap.
 *  Mercy rule caps a player at 2 plate appearances in one inning. */
export type InningMap = Record<number, PlateAppearance[]>;

export interface PlayerGameData {
  playerId: string;
  name: string;
  innings: InningMap;
}

export interface TeamGameData {
  teamId: string;
  name: string;
  players: PlayerGameData[];
}

export type TeamKey = "home" | "away";

export interface PlayerTotals {
  ab: number;
  h: number;
  r: number;
  rbi: number;
  bb: number;
  k: number;
  sb: number;
}

/** undefined = auto-calculated from batting data; a number = manually locked in
 *  and independent of the batting grid from then on. */
export type LineScoreOverrides = Record<number, number | undefined>;

export interface ModalTarget {
  team: TeamKey;
  playerId: string;
  inning: number;
}
