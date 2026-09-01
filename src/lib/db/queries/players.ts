import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
    players,
    batting,
    games,
    teams,
    rosters,
    homeTeam,
    awayTeam,
    substitutes
} from '@/lib/db/schema';
import { NewPlayer } from '@/lib/types'

export async function getPlayerNames() {
    return db
        .select({
            id: players.id,
            firstName: players.firstName,
            lastName: players.lastName,
            team: {
                id: teams.id,
                name: teams.teamName,
            },
        })
        .from(players)
        .leftJoin(teams, eq(players.currentTeam, teams.id))
        .orderBy(players.lastName, players.firstName);
}

export async function getPlayerById(id: number) {
    const [result] = await db
        .select({
            id: players.id,
            firstName: players.firstName,
            lastName: players.lastName,
            currentTeamName: teams.teamName,
        })
        .from(players)
        .leftJoin(teams, eq(players.currentTeam, teams.id))
        .where(eq(players.id, id));
    return result;
}

export async function getPlayerStatsById(playerId: number) {
    return db
        .select({
            year: sql<number>`extract(year from ${games.date})::int`,
            teamName: teams.teamName,

            gamesPlayed: sql<number>`
                count(distinct ${batting.gameId})::int
            `,

            atBat: sql<number>`
                coalesce(sum(${batting.atBat}), 0)::int
            `,

            run: sql<number>`
                coalesce(sum(${batting.run}), 0)::int
            `,

            walk: sql<number>`
                coalesce(sum(${batting.walk}), 0)::int
            `,

            strikeout: sql<number>`
                coalesce(sum(${batting.strikeout}), 0)::int
            `,

            hitByPitch: sql<number>`
                coalesce(sum(${batting.hitByPitch}), 0)::int
            `,

            stolenBase: sql<number>`
                coalesce(sum(${batting.stolenBase}), 0)::int
            `,

            runsBattedIn: sql<number>`
                coalesce(sum(${batting.runsBattedIn}), 0)::int
            `,

            sacrifice: sql<number>`
                coalesce(sum(${batting.sacrifice}), 0)::int
            `,

            singleHit: sql<number>`
                coalesce(sum(${batting.singleHit}), 0)::int
            `,

            doubleHit: sql<number>`
                coalesce(sum(${batting.doubleHit}), 0)::int
            `,

            tripleHit: sql<number>`
                coalesce(sum(${batting.tripleHit}), 0)::int
            `,

            homeRun: sql<number>`
                coalesce(sum(${batting.homeRun}), 0)::int
            `,

            roe: sql<number>`
                coalesce(sum(${batting.roe}), 0)::int
            `,

            hits: sql<number>`
                coalesce(
                    sum(
                        coalesce(${batting.singleHit}, 0)
                        + coalesce(${batting.doubleHit}, 0)
                        + coalesce(${batting.tripleHit}, 0)
                        + coalesce(${batting.homeRun}, 0)
                    ),
                    0
                )::int
            `,

            avg: sql<number | null>`
                case
                    when coalesce(sum(${batting.atBat}), 0) > 0
                    then round(
                        (
                            coalesce(
                                sum(
                                    coalesce(${batting.singleHit}, 0)
                                    + coalesce(${batting.doubleHit}, 0)
                                    + coalesce(${batting.tripleHit}, 0)
                                    + coalesce(${batting.homeRun}, 0)
                                ),
                                0
                            )::numeric
                            / sum(${batting.atBat})
                        ),
                        3
                    )
                    else null
                end
            `,

            obp: sql<number | null>`
                case
                    when (
                        coalesce(sum(${batting.atBat}), 0)
                        + coalesce(sum(${batting.walk}), 0)
                        + coalesce(sum(${batting.hitByPitch}), 0)
                        + coalesce(sum(${batting.sacrifice}), 0)
                    ) > 0
                    then round(
                        (
                            coalesce(
                                sum(
                                    coalesce(${batting.singleHit}, 0)
                                    + coalesce(${batting.doubleHit}, 0)
                                    + coalesce(${batting.tripleHit}, 0)
                                    + coalesce(${batting.homeRun}, 0)
                                ),
                                0
                            )
                            + coalesce(sum(${batting.walk}), 0)
                            + coalesce(sum(${batting.hitByPitch}), 0)
                        )::numeric
                        / (
                            coalesce(sum(${batting.atBat}), 0)
                            + coalesce(sum(${batting.walk}), 0)
                            + coalesce(sum(${batting.hitByPitch}), 0)
                            + coalesce(sum(${batting.sacrifice}), 0)
                        ),
                        3
                    )
                    else null
                end
            `,

            slg: sql<number | null>`
                case
                    when coalesce(sum(${batting.atBat}), 0) > 0
                    then round(
                        (
                            coalesce(sum(${batting.singleHit}), 0)
                            + 2 * coalesce(sum(${batting.doubleHit}), 0)
                            + 3 * coalesce(sum(${batting.tripleHit}), 0)
                            + 4 * coalesce(sum(${batting.homeRun}), 0)
                        )::numeric
                        / sum(${batting.atBat}),
                        3
                    )
                    else null
                end
            `,

            ops: sql<number | null>`
                case
                    when (
                        coalesce(sum(${batting.atBat}), 0)
                        + coalesce(sum(${batting.walk}), 0)
                        + coalesce(sum(${batting.hitByPitch}), 0)
                        + coalesce(sum(${batting.sacrifice}), 0)
                    ) > 0
                    then round(
                        (
                            (
                                (
                                    coalesce(
                                        sum(
                                            coalesce(${batting.singleHit}, 0)
                                            + coalesce(${batting.doubleHit}, 0)
                                            + coalesce(${batting.tripleHit}, 0)
                                            + coalesce(${batting.homeRun}, 0)
                                        ),
                                        0
                                    )
                                    + coalesce(sum(${batting.walk}), 0)
                                    + coalesce(sum(${batting.hitByPitch}), 0)
                                )::numeric
                                / (
                                    coalesce(sum(${batting.atBat}), 0)
                                    + coalesce(sum(${batting.walk}), 0)
                                    + coalesce(sum(${batting.hitByPitch}), 0)
                                    + coalesce(sum(${batting.sacrifice}), 0)
                                )
                            )
                            +
                            (
                                coalesce(sum(${batting.singleHit}), 0)
                                + 2 * coalesce(sum(${batting.doubleHit}), 0)
                                + 3 * coalesce(sum(${batting.tripleHit}), 0)
                                + 4 * coalesce(sum(${batting.homeRun}), 0)
                            )::numeric
                            / sum(${batting.atBat})
                        ),
                        3
                    )
                    else null
                end
            `,
        })
        .from(batting)
        .innerJoin(games, eq(batting.gameId, games.id))
        .leftJoin(rosters, and(
            eq(rosters.playerId, playerId),
            eq(rosters.teamId, games.homeTeamId),
        ))
        .leftJoin(teams, eq(rosters.teamId, teams.id))
        .where(eq(batting.playerId, playerId))
        .groupBy(
            sql`extract(year from ${games.date})`,
            teams.teamName,
        )
        .orderBy(
            desc(sql`extract(year from ${games.date})`),
        );
}

export async function getPlayerGameLog(
    playerId: number,
    year?: number,
) {
    const conditions = [
        eq(batting.playerId, playerId),
    ];

    if (year !== undefined) {
        conditions.push(
            gte(games.date, `${year}-01-01`),
            lte(games.date, `${year}-12-31`),
        );
    }

    return db
        .select({
            gameId: games.id,
            date: games.date,

            playerTeamId: rosters.teamId,
            playerTeam: teams.teamName,

            homeTeamId: games.homeTeamId,
            homeTeamName: homeTeam.teamName,

            awayTeamId: games.awayTeamId,
            awayTeamName: awayTeam.teamName,

            atBat: batting.atBat,
            run: batting.run,
            walk: batting.walk,
            strikeout: batting.strikeout,
            hitByPitch: batting.hitByPitch,
            stolenBase: batting.stolenBase,
            runsBattedIn: batting.runsBattedIn,
            sacrifice: batting.sacrifice,
            singleHit: batting.singleHit,
            doubleHit: batting.doubleHit,
            tripleHit: batting.tripleHit,
            homeRun: batting.homeRun,
            roe: batting.roe,
        })
        .from(batting)
        .innerJoin(games, eq(batting.gameId, games.id))
        .leftJoin(
            rosters,
            and(
                eq(rosters.playerId, playerId),
                sql`${games.date} <@ ${rosters.activePeriod}`,
            ),
        )
        .leftJoin(teams, eq(rosters.teamId, teams.id))
        .leftJoin(homeTeam, eq(games.homeTeamId, homeTeam.id))
        .leftJoin(awayTeam, eq(games.awayTeamId, awayTeam.id))
        .where(and(...conditions))
        .orderBy(desc(games.date));
}

export async function getPlayersWithStats(
    yearFrom?: number,
    yearTo?: number,
) {
    const conditions = [];

    if (yearFrom !== undefined) {
        conditions.push(
            gte(games.date, `${yearFrom}-01-01`)
        );
    }

    if (yearTo !== undefined) {
        conditions.push(
            lte(games.date, `${yearTo}-12-31`)
        );
    }

    return db
        .select({
            id: players.id,
            firstName: players.firstName,
            lastName: players.lastName,

            currentTeamId: players.currentTeam,
            currentTeamName: teams.teamName,

            gamesPlayed: sql<number>`
                count(distinct ${batting.gameId})::int
            `,

            atBat: sql<number>`
                coalesce(sum(${batting.atBat}), 0)::int
            `,

            run: sql<number>`
                coalesce(sum(${batting.run}), 0)::int
            `,

            walk: sql<number>`
                coalesce(sum(${batting.walk}), 0)::int
            `,

            strikeout: sql<number>`
                coalesce(sum(${batting.strikeout}), 0)::int
            `,

            hitByPitch: sql<number>`
                coalesce(sum(${batting.hitByPitch}), 0)::int
            `,

            stolenBase: sql<number>`
                coalesce(sum(${batting.stolenBase}), 0)::int
            `,

            runsBattedIn: sql<number>`
                coalesce(sum(${batting.runsBattedIn}), 0)::int
            `,

            sacrifice: sql<number>`
                coalesce(sum(${batting.sacrifice}), 0)::int
            `,

            singleHit: sql<number>`
                coalesce(sum(${batting.singleHit}), 0)::int
            `,

            doubleHit: sql<number>`
                coalesce(sum(${batting.doubleHit}), 0)::int
            `,

            tripleHit: sql<number>`
                coalesce(sum(${batting.tripleHit}), 0)::int
            `,

            homeRun: sql<number>`
                coalesce(sum(${batting.homeRun}), 0)::int
            `,

            roe: sql<number>`
                coalesce(sum(${batting.roe}), 0)::int
            `,

            hits: sql<number>`
                coalesce(
                    sum(
                        coalesce(${batting.singleHit}, 0)
                        + coalesce(${batting.doubleHit}, 0)
                        + coalesce(${batting.tripleHit}, 0)
                        + coalesce(${batting.homeRun}, 0)
                    ),
                    0
                )::int
            `,

            avg: sql<number | null>`
                case
                    when coalesce(sum(${batting.atBat}), 0) > 0
                    then round(
                        (
                            coalesce(
                                sum(
                                    coalesce(${batting.singleHit}, 0)
                                    + coalesce(${batting.doubleHit}, 0)
                                    + coalesce(${batting.tripleHit}, 0)
                                    + coalesce(${batting.homeRun}, 0)
                                ),
                                0
                            )::numeric
                            / sum(${batting.atBat})
                        ),
                        3
                    )
                    else null
                end
            `,

            obp: sql<number | null>`
                case
                    when (
                        coalesce(sum(${batting.atBat}), 0)
                        + coalesce(sum(${batting.walk}), 0)
                        + coalesce(sum(${batting.hitByPitch}), 0)
                        + coalesce(sum(${batting.sacrifice}), 0)
                    ) > 0
                    then round(
                        (
                            coalesce(
                                sum(
                                    coalesce(${batting.singleHit}, 0)
                                    + coalesce(${batting.doubleHit}, 0)
                                    + coalesce(${batting.tripleHit}, 0)
                                    + coalesce(${batting.homeRun}, 0)
                                ),
                                0
                            )
                            + coalesce(sum(${batting.walk}), 0)
                            + coalesce(sum(${batting.hitByPitch}), 0)
                        )::numeric
                        / (
                            coalesce(sum(${batting.atBat}), 0)
                            + coalesce(sum(${batting.walk}), 0)
                            + coalesce(sum(${batting.hitByPitch}), 0)
                            + coalesce(sum(${batting.sacrifice}), 0)
                        ),
                        3
                    )
                    else null
                end
            `,

            slg: sql<number | null>`
                case
                    when coalesce(sum(${batting.atBat}), 0) > 0
                    then round(
                        (
                            coalesce(sum(${batting.singleHit}), 0)
                            + 2 * coalesce(sum(${batting.doubleHit}), 0)
                            + 3 * coalesce(sum(${batting.tripleHit}), 0)
                            + 4 * coalesce(sum(${batting.homeRun}), 0)
                        )::numeric
                        / sum(${batting.atBat}),
                        3
                    )
                    else null
                end
            `,

            ops: sql<number | null>`
                case
                    when coalesce(sum(${batting.atBat}), 0) > 0
                    then round(
                        (
                            (
                                (
                                    coalesce(
                                        sum(
                                            coalesce(${batting.singleHit}, 0)
                                            + coalesce(${batting.doubleHit}, 0)
                                            + coalesce(${batting.tripleHit}, 0)
                                            + coalesce(${batting.homeRun}, 0)
                                        ),
                                        0
                                    )
                                    + coalesce(sum(${batting.walk}), 0)
                                    + coalesce(sum(${batting.hitByPitch}), 0)
                                )::numeric
                                / (
                                    coalesce(sum(${batting.atBat}), 0)
                                    + coalesce(sum(${batting.walk}), 0)
                                    + coalesce(sum(${batting.hitByPitch}), 0)
                                    + coalesce(sum(${batting.sacrifice}), 0)
                                )
                            )
                            +
                            (
                                coalesce(sum(${batting.singleHit}), 0)
                                + 2 * coalesce(sum(${batting.doubleHit}), 0)
                                + 3 * coalesce(sum(${batting.tripleHit}), 0)
                                + 4 * coalesce(sum(${batting.homeRun}), 0)
                            )::numeric
                            / sum(${batting.atBat})
                        ),
                        3
                    )
                    else null
                end
            `,
        })
        .from(players)
        .leftJoin(
            batting,
            eq(players.id, batting.playerId),
        )
        .leftJoin(
            games,
            eq(batting.gameId, games.id),
        )
        .leftJoin(
            teams,
            eq(players.currentTeam, teams.id),
        )
        .where(
            conditions.length > 0
                ? and(...conditions)
                : undefined,
        )
        .groupBy(
            players.id,
            players.firstName,
            players.lastName,
            players.currentTeam,
            teams.teamName,
        )
        .orderBy(
            players.lastName,
            players.firstName,
        );
}

export async function createPlayer(data: NewPlayer) {
    return db.insert(players).values(data).returning();
}

export async function updatePlayer(id: number, data: Partial<NewPlayer>) {
    return db.update(players).set(data).where(eq(players.id, id)).returning();
}

// Deleting a player wipes their dependent rows first (rosters, substitute
// appearances, batting stats) rather than blocking on FK constraints — the
// preference here is "let old players actually go away cleanly" rather than
// keeping them stuck because deleting would otherwise 500/409.
export async function deletePlayer(id: number) {
    return db.transaction(async (tx) => {
        await tx.delete(batting).where(eq(batting.playerId, id));
        await tx.delete(substitutes).where(eq(substitutes.playerId, id));
        await tx.delete(rosters).where(eq(rosters.playerId, id));
        return tx.delete(players).where(eq(players.id, id)).returning();
    });
}
