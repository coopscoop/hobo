import { db } from '@/lib/db';
import { games, leagues, innings, batting, players, rosters, fields } from '@/lib/db/schema';
import { homeTeam, awayTeam } from '@/lib/db/schema';
import { eq, and, gte, lt, lte, desc, sql, or } from 'drizzle-orm';
import { substitutes } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import type { InningMap, PlayerGameData, TeamGameData, TeamKey } from '@/lib/types';
import { GameFilters } from '@/lib/searchParams/games';

/// ---- Date ----
const isIsoDate = (s?: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s)

// cloud run runs in UTC, so a plain toISOString() flips to "tomorrow" in the evening
const todayInToronto = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' }) // en-CA gives YYYY-MM-DD

// ---- Types ----

// ---- Shared select shape ----

const gameSelect = {
    id: games.id,
    date: games.date,
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
    const from = isIsoDate(filters.from) ? filters.from : undefined

    const to =
        filters.to === 'all'
            ? undefined
            : isIsoDate(filters.to) ? filters.to : todayInToronto()

    const [t1, t2] = filters.teams ?? []
    const teamFilter =
        t1 != null && t2 != null
            ? and(
                inArray(games.homeTeamId, [t1, t2]),
                inArray(games.awayTeamId, [t1, t2]),
            )
            : t1 != null
                ? or(eq(games.homeTeamId, t1), eq(games.awayTeamId, t1))
                : undefined

    const seasonFilter =
        filters.season === 'regular' ? eq(games.isPlayoff, false)
            : filters.season === 'playoffs' ? eq(games.isPlayoff, true)
                : undefined // 'all'

    return gameJoins(
        db.select({
            ...gameSelect,
            fieldName: fields.name,
        }).from(games)
    )
        .leftJoin(fields, eq(games.fieldId, fields.id))
        .where(
            and(
                from ? gte(games.date, from) : undefined,
                to ? lte(games.date, to) : undefined,
                seasonFilter,
                teamFilter,
                filters.field != null ? eq(games.fieldId, filters.field) : undefined,
            )
        )
        .orderBy(desc(games.date))
}

export async function getGameById(idString: string) {
    const id = parseInt(idString, 10);

    const [game] = await gameJoins(
        db.select({
            ...gameSelect,
            fieldName: fields.name,
        }).from(games))
        .leftJoin(fields, eq(games.fieldId, fields.id))
        .where(eq(games.id, id));

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
                    sql`${rosters.activePeriod} @> ${game.date}::date`
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
            minYear: sql<number>`min(extract(year from ${games.date}))::int`,
            maxYear: sql<number>`max(extract(year from ${games.date}))::int`,
        })
        .from(games);

    return result;
}

export async function getUpcomingGames(leagueId?: string | null) {
    return gameJoins(
        db.select({
            ...gameSelect,
            fieldName: fields.name,
        }).from(games)
    )
        .leftJoin(fields, eq(games.fieldId, fields.id))
        .where(
            and(
                gte(games.date, sql`current_date`),
                lte(games.date, sql`current_date + interval '7 days'`),
                leagueId && leagueId !== 'all'
                    ? eq(games.leagueId, parseInt(leagueId))
                    : undefined
            )
        )
        .orderBy(games.date);
}

export async function getRecentGames() {
    return gameJoins(db.select(gameSelect).from(games))
        .where(
            and(
                gte(games.date, sql`current_date - interval '30 days'`),
                lt(games.date, sql`current_date`),
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

    type StoredPlayerJson = { isPresent?: boolean; order?: number; innings?: InningMap } | InningMap | null;

    function unpackStored(stored: StoredPlayerJson, fallbackOrder: number) {
        // legacy rows: perInning was the bare InningMap itself (numbered keys, no `.innings`)
        const isLegacy = stored && typeof stored === "object" && !("innings" in stored);
        return {
            innings: (isLegacy ? (stored as InningMap) : (stored as any)?.innings) ?? {},
            isPresent: (stored as any)?.isPresent ?? true,
            order: (stored as any)?.order ?? fallbackOrder,
        };
    }

    function toPlayerData(
        p: { playerId: number; firstName: string | null; lastName: string | null },
        fallbackOrder: number
    ): PlayerGameData {
        const existing = battingByPlayer.get(p.playerId);
        const { innings, isPresent, order } = unpackStored(existing?.perInning as StoredPlayerJson, fallbackOrder);
        return {
            playerId: String(p.playerId),
            name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
            innings,
            isPresent,
            order,
        };
    }

    function subToPlayerData(sub: typeof subs[number], fallbackOrder: number): PlayerGameData {
        const p = subPlayerMap.get(sub.playerId);
        const existing = battingByPlayer.get(sub.playerId);
        const { innings, isPresent, order } = unpackStored(existing?.perInning as StoredPlayerJson, fallbackOrder);
        return {
            playerId: String(sub.playerId),
            name: p ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() : "Unknown Player",
            innings,
            isPresent,
            order,
            isSubstitute: true,
            subId: sub.id,
        };
    }

    function buildTeam(teamId: number, name: string, roster: typeof homeRoster): TeamGameData {
        const teamSubs = subs.filter((s) => s.newTeamId === teamId);
        const rosterPlayers = roster.map((p, idx) => toPlayerData(p, idx));
        const subPlayers = teamSubs.map((s, idx) => subToPlayerData(s, roster.length + idx));
        return {
            teamId: String(teamId),
            name,
            players: [...rosterPlayers, ...subPlayers].sort((a, b) => a.order - b.order),
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
