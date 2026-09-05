import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
    announcements, games, batting, innings, pitching, substitutes,
    leagues, teams, players, rosters, executives, pages, fields
} from "@/lib/db/schema";
import { getGames, getGameById } from '@/lib/db/queries/games';
import { getPlayerById, getPlayerGameLog, getPlayerNames, getPlayersWithStats } from '@/lib/db/queries/players';
import { getTeams, getTeamById } from '@/lib/db/queries/teams';

// ---- Base types from schema ----
export type Announcement = InferSelectModel<typeof announcements>;
export type NewAnnouncement = InferInsertModel<typeof announcements>;

export type Game = InferSelectModel<typeof games>;
export type NewGame = InferInsertModel<typeof games>;

export type Batting = InferSelectModel<typeof batting>;
export type NewBatting = InferInsertModel<typeof batting>;

export type Inning = InferSelectModel<typeof innings>;
export type NewInning = InferInsertModel<typeof innings>;

export type Pitching = InferSelectModel<typeof pitching>;
export type NewPitching = InferInsertModel<typeof pitching>;

export type Substitute = InferSelectModel<typeof substitutes>;
export type NewSubstitute = InferInsertModel<typeof substitutes>;

export type League = InferSelectModel<typeof leagues>;
export type NewLeague = InferInsertModel<typeof leagues>;

export type Team = InferSelectModel<typeof teams>;
export type NewTeam = InferInsertModel<typeof teams>;

export type Player = InferSelectModel<typeof players>;
export type NewPlayer = InferInsertModel<typeof players>;

export type Roster = InferSelectModel<typeof rosters>;
export type NewRoster = InferInsertModel<typeof rosters>;

export type Executive = InferSelectModel<typeof executives>;
export type NewExecutive = InferInsertModel<typeof executives>;

export type Page = InferSelectModel<typeof pages>;
export type NewPage = InferInsertModel<typeof pages>;

export type Field = InferSelectModel<typeof fields>;
export type NewField = InferInsertModel<typeof fields>;

// ---- Custom types from queries ----
export type GameListItem = Awaited<ReturnType<typeof getGames>>[number];
export type GameDetail = Awaited<ReturnType<typeof getGameById>>;
export type PlayerWithStats = Awaited<ReturnType<typeof getPlayersWithStats>>[number];
export type PlayerById = Awaited<ReturnType<typeof getPlayerById>>;
export type PlayerGameLog = Awaited<ReturnType<typeof getPlayerGameLog>>;
export type TeamWithPlayers = Awaited<ReturnType<typeof getTeams>>[number];
export type TeamDetail = Awaited<ReturnType<typeof getTeamById>>;
export type PlayerName = Awaited<ReturnType<typeof getPlayerNames>>[number];
export type TeamById = Awaited<ReturnType<typeof getTeamById>>;

// ---- Score Sheet types ----
export type ResultCode = "OUT" | "K" | "BB" | "HBP" | "1B" | "2B" | "3B" | "HR";

export type ResultGroup = "out" | "reach" | "hit" | "homer";

export interface PlateAppearance {
    result: ResultCode | null;
    sac: boolean;
    fc: boolean;
    roe: boolean;
    rbi: null | 0 | 1 | 2 | 3 | 4;
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
    pa: number;
}

/** undefined = auto-calculated from batting data; a number = manually locked in
 *  and independent of the batting grid from then on. */
export type LineScoreOverrides = Record<number, number | undefined>;

export interface ModalTarget {
    team: TeamKey;
    playerId: string;
    inning: number;
}

export interface BattingRow {
    plateAppearance: number;
    atBat: number;
    run: number;
    walk: number;
    strikeout: number;
    hitByPitch: number;
    stolenBase: number;
    runsBattedIn: number;
    sacrifice: number;
    singleHit: number;
    doubleHit: number;
    tripleHit: number;
    homeRun: number;
}

export interface PlayerGameData {
    playerId: string;
    name: string;
    innings: InningMap;
    isSubstitute?: boolean;
    subId?: number; // Substitutes.id — only present when isSubstitute is true, used for the remove-button DELETE call
}
