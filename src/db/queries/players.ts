import { db } from '@/db';
import { players, batting, games, teams, rosters, homeTeam, awayTeam } from '@/db/schema';
import { eq, sql, and, gte, lte, desc, between } from 'drizzle-orm';

export interface PlayerFilters {
    yearFrom?: string;
    yearTo?: string;
    activeOnly?: boolean;
}

export async function getPlayers(filters: PlayerFilters = {}) {
    const conditions = [];

    if (filters.yearFrom) {
        conditions.push(gte(games.date, `${filters.yearFrom}-01-01`));
    }
    if (filters.yearTo) {
        conditions.push(lte(games.date, `${filters.yearTo}-12-31`));
    }

    return db
        .select({
            id: players.id,
            firstName: players.firstName,
            lastName: players.lastName,
            currentTeam: teams.teamName,
            gamesPlayed: sql<number>`count(distinct ${batting.gameId})`,
            atBats: sql<number>`sum(${batting.atBat})`,
            runs: sql<number>`sum(${batting.run})`,
            walks: sql<number>`sum(${batting.walk})`,
            strikeouts: sql<number>`sum(${batting.strikeout})`,
            hitByPitch: sql<number>`sum(${batting.hitByPitch})`,
            stolenBases: sql<number>`sum(${batting.stolenBase})`,
            rbi: sql<number>`sum(${batting.runsBattedIn})`,
            sacrifice: sql<number>`sum(${batting.sacrifice})`,
            singles: sql<number>`sum(${batting.singleHit})`,
            doubles: sql<number>`sum(${batting.doubleHit})`,
            triples: sql<number>`sum(${batting.tripleHit})`,
            homeRuns: sql<number>`sum(${batting.homeRun})`,
            roe: sql<number>`sum(${batting.roe})`,
            hits: sql<number>`
        sum(${batting.singleHit}) +
        sum(${batting.doubleHit}) +
        sum(${batting.tripleHit}) +
        sum(${batting.homeRun})
      `,
            obp: sql<number>`
        round(
          cast(
            sum(${batting.singleHit}) + sum(${batting.doubleHit}) +
            sum(${batting.tripleHit}) + sum(${batting.homeRun}) +
            sum(${batting.walk}) + sum(${batting.hitByPitch})
          as numeric) /
          nullif(
            sum(${batting.atBat}) + sum(${batting.walk}) +
            sum(${batting.hitByPitch}) + sum(${batting.sacrifice}),
          0),
        3)
      `,
            slg: sql<number>`
        round(
          cast(
            sum(${batting.singleHit}) +
            (sum(${batting.doubleHit}) * 2) +
            (sum(${batting.tripleHit}) * 3) +
            (sum(${batting.homeRun}) * 4)
          as numeric) /
          nullif(sum(${batting.atBat}), 0),
        3)
      `,
            ops: sql<number>`
        round(
          cast(
            sum(${batting.singleHit}) + sum(${batting.doubleHit}) +
            sum(${batting.tripleHit}) + sum(${batting.homeRun}) +
            sum(${batting.walk}) + sum(${batting.hitByPitch})
          as numeric) /
          nullif(
            sum(${batting.atBat}) + sum(${batting.walk}) +
            sum(${batting.hitByPitch}) + sum(${batting.sacrifice}),
          0) +
          cast(
            sum(${batting.singleHit}) +
            (sum(${batting.doubleHit}) * 2) +
            (sum(${batting.tripleHit}) * 3) +
            (sum(${batting.homeRun}) * 4)
          as numeric) /
          nullif(sum(${batting.atBat}), 0),
        3)
      `,
        })
        .from(players)
        .leftJoin(batting, eq(batting.playerId, players.id))
        .leftJoin(games, eq(games.id, batting.gameId))
        .leftJoin(teams, eq(teams.id, players.currentTeam))
        .where(conditions.length ? and(...conditions) : undefined)
        .groupBy(players.id, players.firstName, players.lastName, teams.teamName)
        .orderBy(players.lastName, players.firstName);
}

export async function getPlayerById(idString: string) {
    const id = parseInt(idString, 10);
    if (isNaN(id)) throw new Error('Invalid resource ID format.');

    const [player] = await db
        .select({
            id: players.id,
            firstName: players.firstName,
            lastName: players.lastName,
            currentTeam: teams.teamName,
        })
        .from(players)
        .leftJoin(teams, eq(teams.id, players.currentTeam))
        .where(eq(players.id, id));

    if (!player) return null;

    const statsByYear = await db
        .select(
            {
                year: sql<number>`extract(year from ${games.date})::int`,
                teamName: sql<string>`mode() within group (order by ${teams.teamName})`,
                gamesPlayed: sql<number>`count(distinct ${batting.gameId})`,
                atBats: sql<number>`sum(${batting.atBat})`,
                runs: sql<number>`sum(${batting.run})`,
                walks: sql<number>`sum(${batting.walk})`,
                strikeouts: sql<number>`sum(${batting.strikeout})`,
                hitByPitch: sql<number>`sum(${batting.hitByPitch})`,
                stolenBases: sql<number>`sum(${batting.stolenBase})`,
                rbi: sql<number>`sum(${batting.runsBattedIn})`,
                sacrifice: sql<number>`sum(${batting.sacrifice})`,
                singles: sql<number>`sum(${batting.singleHit})`,
                doubles: sql<number>`sum(${batting.doubleHit})`,
                triples: sql<number>`sum(${batting.tripleHit})`,
                homeRuns: sql<number>`sum(${batting.homeRun})`,
                roe: sql<number>`sum(${batting.roe})`,
                hits: sql<number>`
        sum(${batting.singleHit}) +
        sum(${batting.doubleHit}) +
        sum(${batting.tripleHit}) +
        sum(${batting.homeRun})
      `,
                obp: sql<number>`
        round(
          cast(
            sum(${batting.singleHit}) + sum(${batting.doubleHit}) +
            sum(${batting.tripleHit}) + sum(${batting.homeRun}) +
            sum(${batting.walk}) + sum(${batting.hitByPitch})
          as numeric) /
          nullif(
            sum(${batting.atBat}) + sum(${batting.walk}) +
            sum(${batting.hitByPitch}) + sum(${batting.sacrifice}),
          0),
        3)
      `,
                slg: sql<number>`
        round(
          cast(
            sum(${batting.singleHit}) +
            (sum(${batting.doubleHit}) * 2) +
            (sum(${batting.tripleHit}) * 3) +
            (sum(${batting.homeRun}) * 4)
          as numeric) /
          nullif(sum(${batting.atBat}), 0),
        3)
      `,
                ops: sql<number>`
        round(
          cast(
            sum(${batting.singleHit}) + sum(${batting.doubleHit}) +
            sum(${batting.tripleHit}) + sum(${batting.homeRun}) +
            sum(${batting.walk}) + sum(${batting.hitByPitch})
          as numeric) /
          nullif(
            sum(${batting.atBat}) + sum(${batting.walk}) +
            sum(${batting.hitByPitch}) + sum(${batting.sacrifice}),
          0) +
          cast(
            sum(${batting.singleHit}) +
            (sum(${batting.doubleHit}) * 2) +
            (sum(${batting.tripleHit}) * 3) +
            (sum(${batting.homeRun}) * 4)
          as numeric) /
          nullif(sum(${batting.atBat}), 0),
        3)
      `,
            }
        )
        .from(batting)
        .where(eq(batting.playerId, id))
        .groupBy(sql`extract(year from ${games.date})::int`)
        .orderBy(sql`extract(year from ${games.date})::int desc`);

    return { player, statsByYear };
}

export async function getPlayerGameLog(idString: string, yearString: string) {
    const id = parseInt(idString, 10);
    const year = parseInt(yearString, 10);

    if (isNaN(id)) throw new Error('Invalid resource ID format.');
    if (isNaN(year)) throw new Error('Invalid year format.');

    return await db
        .select({
            gameId: games.id,
            date: games.date,
            playerTeam: teams.teamName,
            homeTeamName: homeTeam.teamName,
            awayTeamName: awayTeam.teamName,
            homeTeamId: games.homeTeamId,
            awayTeamId: games.awayTeamId,
            rosterTeamId: rosters.teamId,
            atBat: batting.atBat,
            run: batting.run,
            walk: batting.walk,
            strikeout: batting.strikeout,
            hitByPitch: batting.hitByPitch,
            stolenBase: batting.stolenBase,
            rbi: batting.runsBattedIn,
            sacrifice: batting.sacrifice,
            singleHit: batting.singleHit,
            doubleHit: batting.doubleHit,
            tripleHit: batting.tripleHit,
            homeRun: batting.homeRun,
            roe: batting.roe,
        })
        .from(batting)
        .where(
            and(
                eq(batting.playerId, id),
                between(games.date, `${year}-01-01`, `${year}-12-31`)
            )
        )
        .orderBy(desc(games.date));
}
