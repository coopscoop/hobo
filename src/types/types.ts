import { InferSelectModel } from "drizzle-orm";
import { announcements, games, batting, innings } from "@/db/schema";
import { getGames, getGameById } from '@/db/queries/games';
import { getPlayersWithStats, getPlayerById, getPlayerGameLog } from '@/db/queries/players';
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
export type PlayerWithStats = Awaited<ReturnType<typeof getPlayersWithStats>>[number];
export type PlayerById = Awaited<ReturnType<typeof getPlayerById>>;
export type PlayerGameLog = Awaited<ReturnType<typeof getPlayerGameLog>>;
