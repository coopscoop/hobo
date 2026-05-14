import { db } from '@/db';
import { games, leagues, innings, batting, players, rosters } from '@/db/schema';
import { homeTeam, awayTeam } from '@/db/schema';
import { eq, and, or, gte, lt, lte, desc, sql, type SQL } from 'drizzle-orm';

// ---- Types ----

export interface GameFilters {
  teamId?: string | null;
  leagueId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  playoff?: string | null;
}

// ---- Filter builder ----

function buildGameFilters(params: GameFilters) {
  const filters: SQL[] = [];

  if (params.leagueId) filters.push(eq(games.leagueId, parseInt(params.leagueId)));
  if (params.dateFrom) filters.push(gte(games.date, params.dateFrom));
  if (params.dateTo) filters.push(lte(games.date, params.dateTo));
  if (params.playoff) filters.push(eq(games.isPlayoff, params.playoff === 'true'));
  if (params.teamId) {
    const id = parseInt(params.teamId);
    filters.push(or(eq(games.homeTeamId, id), eq(games.awayTeamId, id))!);
  }

  return filters.length ? and(...filters) : undefined;
}

// ---- Shared select shape ----

const gameSelect = {
  id: games.id,
  date: games.date,
  location: games.location,
  isPlayoff: games.isPlayoff,
  homeScore: games.homeScore,
  awayScore: games.awayScore,
  notes: games.notes,
  homeTeam: { id: homeTeam.id, name: homeTeam.teamName },
  awayTeam: { id: awayTeam.id, name: awayTeam.teamName },
  league: { id: leagues.id, name: leagues.leagueName },
};

const battingStatsSelect = {
  playerId: players.id,
  firstName: players.firstName,
  lastName: players.lastName,
  teamId: rosters.teamId,
  atBat: batting.atBat,
  run: batting.run,
  single: batting.singleHit,
  double: batting.doubleHit,
  triple: batting.tripleHit,
  homeRun: batting.homeRun,
  rbi: batting.runsBattedIn,
  walk: batting.walk,
  strikeout: batting.strikeout,
  stolenBase: batting.stolenBase,
  hitByPitch: batting.hitByPitch,
  sacrifice: batting.sacrifice,
  roe: batting.roe,
}

const gameJoins = (query: any) =>
  query
    .innerJoin(homeTeam, eq(games.homeTeamId, homeTeam.id))
    .innerJoin(awayTeam, eq(games.awayTeamId, awayTeam.id))
    .innerJoin(leagues, eq(games.leagueId, leagues.id));

// ---- Queries ----

export async function getGames(filters: GameFilters = {}) {
  return gameJoins(
    db.select(gameSelect).from(games)
  )
    .where(buildGameFilters(filters))
    .orderBy(desc(games.date));
}

export async function getGameById(id: number) {
  const [game] = await gameJoins(
    db.select(gameSelect).from(games)
  ).where(eq(games.id, id));

  if (!game) return null;

  const [battingStats, inningData] = await Promise.all([
    db
      .select(battingStatsSelect)
      .from(batting)
      .innerJoin(players, eq(batting.playerId, players.id))
      .innerJoin(
        rosters,
        and(
          eq(rosters.playerId, players.id),
          sql`${rosters.activePeriod} @> ${game.date}::date`  // range containment
        )
      )
      .where(eq(batting.gameId, id)),
    db
      .select()
      .from(innings)
      .where(eq(innings.gameId, id))
      .orderBy(innings.inning),
  ]);

  return { game, batting: battingStats, innings: inningData };
}

export async function getGameYearRange() {
  const [result] = await db
    .select({
      minYear: sql<number>`extract(year from min(${games.date}))::int`,
      maxYear: sql<number>`extract(year from max(${games.date}))::int`,
    })
    .from(games);

  return result;
}

export async function getUpcomingGames() {
  return gameJoins(
    db.select(gameSelect).from(games)
  )
    .where(
      and(
        gte(games.date, sql`current_date`),
        lte(games.date, sql`current_date + interval '7 days'`)
      )
    )
    .orderBy(games.date);
}

export async function getRecentGames() {
  return gameJoins(
    db.select(gameSelect).from(games)
  )
    .where(
      and(
        gte(games.date, sql`current_date - interval '30 days'`),
        lt(games.date, sql`current_date`)
      )
    )
    .orderBy(desc(games.date));
  // .limit(10);
}
