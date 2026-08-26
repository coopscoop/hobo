import { db } from '@/db';
import { games, leagues, innings, batting, players, rosters } from '@/db/schema';
import { homeTeam, awayTeam } from '@/db/schema';
import { eq, and, or, gte, lt, lte, desc, sql, type SQL } from 'drizzle-orm';
import { substitutes } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import type { InningMap, PlayerGameData, TeamGameData, TeamKey } from '@/types/types';

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

export async function getGameById(idString: string) {
    const id = parseInt(idString, 10);

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

export async function getUpcomingGames(leagueId?: string | null) {
    return gameJoins(db.select(gameSelect).from(games))
        .where(
            and(
                // NOTE: remove the 1 year to make these accurate to the current date
                gte(games.date, sql`current_date - interval '1 year'`),
                lte(games.date, sql`current_date - interval '1 year' + interval '7 days'`),
                leagueId && leagueId !== 'all'
                    ? eq(games.leagueId, parseInt(leagueId))
                    : undefined
            )
        )
        .orderBy(games.date);
}

export async function getRecentGames(leagueId?: string | null) {
    return gameJoins(db.select(gameSelect).from(games))
        .where(
            and(
                gte(games.date, sql`current_date - interval '30 days'`),
                lt(games.date, sql`current_date`),
                leagueId && leagueId !== 'all'
                    ? eq(games.leagueId, parseInt(leagueId))
                    : undefined
            )
        )
        .orderBy(desc(games.date))
        .limit(10);
}

export async function getGameEditData(idString: string) {
    const id = parseInt(idString, 10);

    const [game] = await gameJoins(
        db.select(gameSelect).from(games)
    ).where(eq(games.id, id));

    if (!game) return null;

    const rosterQuery = (teamId: number) =>
        db
            .select({ playerId: players.id, firstName: players.firstName, lastName: players.lastName })
            .from(rosters)
            .innerJoin(players, eq(rosters.playerId, players.id))
            .where(
                and(
                    eq(rosters.teamId, teamId),
                    sql`${rosters.activePeriod} @> ${game.date}::date`
                )
            );

    const [homeRoster, awayRoster, subs, existingBatting] = await Promise.all([
        rosterQuery(game.homeTeam.id),
        rosterQuery(game.awayTeam.id),
        db.select().from(substitutes).where(eq(substitutes.gameId, id)),
        db.select().from(batting).where(eq(batting.gameId, id)),
    ]);

    const battingByPlayer = new Map(existingBatting.map((b) => [b.playerId, b]));

    const subPlayerIds = subs.map((s) => s.playerId);
    const subPlayers = subPlayerIds.length
        ? await db
              .select({ id: players.id, firstName: players.firstName, lastName: players.lastName })
              .from(players)
              .where(inArray(players.id, subPlayerIds))
        : [];
    const subPlayerMap = new Map(subPlayers.map((p) => [p.id, p]));

    function toPlayerData(p: { playerId: number; firstName: string | null; lastName: string | null }): PlayerGameData {
        const existing = battingByPlayer.get(p.playerId);
        return {
            playerId: String(p.playerId),
            name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
            innings: (existing?.perInning as InningMap) ?? {},
        };
    }

    function subToPlayerData(sub: typeof subs[number]): PlayerGameData {
        const p = subPlayerMap.get(sub.playerId);
        const existing = battingByPlayer.get(sub.playerId);
        return {
            playerId: String(sub.playerId),
            name: p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : 'Unknown Player',
            innings: (existing?.perInning as InningMap) ?? {},
            isSubstitute: true,
            subId: sub.id,
        };
    }

    function buildTeam(teamId: number, name: string, roster: typeof homeRoster): TeamGameData {
        const teamSubs = subs.filter((s) => s.newTeamId === teamId);
        return {
            teamId: String(teamId),
            name,
            players: [...roster.map(toPlayerData), ...teamSubs.map(subToPlayerData)],
        };
    }

    return {
        game,
        teams: {
            home: buildTeam(game.homeTeam.id, game.homeTeam.name, homeRoster),
            away: buildTeam(game.awayTeam.id, game.awayTeam.name, awayRoster),
        } as Record<TeamKey, TeamGameData>,
    };
}
