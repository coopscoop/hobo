import { db } from '@/lib/db';
import { teams, games, players, batting, rosters } from '@/lib/db/schema';
import { eq, or, sql, and, isNotNull, gte, lte, lt } from 'drizzle-orm';
import type { StandingType } from '@/lib/types';

export async function getTeams(leagueId?: string | null) {
    const parsedLeagueId = leagueId ? parseInt(leagueId, 10) : undefined;

    const joinCondition = parsedLeagueId
        ? and(
            or(eq(games.homeTeamId, teams.id), eq(games.awayTeamId, teams.id)),
            eq(games.leagueId, parsedLeagueId)
        )
        : or(eq(games.homeTeamId, teams.id), eq(games.awayTeamId, teams.id));

    return db
        .select({
            id: teams.id,
            teamName: teams.teamName,
            wins: sql<number>`count(*) filter (where
        (${games.homeTeamId} = ${teams.id} and ${games.homeScore} > ${games.awayScore}) or
        (${games.awayTeamId} = ${teams.id} and ${games.awayScore} > ${games.homeScore})
      )`,
            losses: sql<number>`count(*) filter (where
        (${games.homeTeamId} = ${teams.id} and ${games.homeScore} < ${games.awayScore}) or
        (${games.awayTeamId} = ${teams.id} and ${games.awayScore} < ${games.homeScore})
      )`,
            ties: sql<number>`count(*) filter (where
        ${games.homeScore} = ${games.awayScore} and
        (${games.homeTeamId} = ${teams.id} or ${games.awayTeamId} = ${teams.id}) and
        ${games.homeScore} is not null
      )`,
        })
        .from(teams)
        .leftJoin(games, joinCondition)
        .groupBy(teams.id, teams.teamName)
        .orderBy(teams.teamName);
}

export async function getTeamById(idString: string) {
    const id = parseInt(idString, 10);
    if (isNaN(id)) throw new Error('Invalid resource ID format.');

    const [team] = await db
        .select({ id: teams.id, teamName: teams.teamName })
        .from(teams)
        .where(eq(teams.id, id));

    if (!team) return null;

    // W/L/T per year
    const recordByYear = await db
        .select({
            year: sql<number>`extract(year from ${games.date})::int`,
            wins: sql<number>`count(*) filter (where
        (${games.homeTeamId} = ${id} and ${games.homeScore} > ${games.awayScore}) or
        (${games.awayTeamId} = ${id} and ${games.awayScore} > ${games.homeScore})
      )`,
            losses: sql<number>`count(*) filter (where
        (${games.homeTeamId} = ${id} and ${games.homeScore} < ${games.awayScore}) or
        (${games.awayTeamId} = ${id} and ${games.awayScore} < ${games.homeScore})
      )`,
            ties: sql<number>`count(*) filter (where
        ${games.homeScore} = ${games.awayScore} and
        (${games.homeTeamId} = ${id} or ${games.awayTeamId} = ${id}) and
        ${games.homeScore} is not null
      )`,
        })
        .from(games)
        .where(
            and(
                or(eq(games.homeTeamId, id), eq(games.awayTeamId, id)),
                isNotNull(games.homeScore)
            )
        )
        .groupBy(sql`extract(year from ${games.date})::int`)
        .orderBy(sql`extract(year from ${games.date})::int desc`);

    // Players + stats per year via roster
    const rosterByYear = await db
        .select({
            year: sql<number>`extract(year from ${games.date})::int`,
            playerId: players.id,
            firstName: players.firstName,
            lastName: players.lastName,
            gamesPlayed: sql<number>`count(distinct ${batting.gameId})`,
            atBats: sql<number>`sum(${batting.atBat})`,
            runs: sql<number>`sum(${batting.run})`,
            singles: sql<number>`sum(${batting.singleHit})`,
            doubles: sql<number>`sum(${batting.doubleHit})`,
            triples: sql<number>`sum(${batting.tripleHit})`,
            homeRuns: sql<number>`sum(${batting.homeRun})`,
            hits: sql<number>`
        sum(${batting.singleHit}) +
        sum(${batting.doubleHit}) +
        sum(${batting.tripleHit}) +
        sum(${batting.homeRun})
      `,
            rbi: sql<number>`sum(${batting.runsBattedIn})`,
            walks: sql<number>`sum(${batting.walk})`,
            strikeouts: sql<number>`sum(${batting.strikeout})`,
            hitByPitch: sql<number>`sum(${batting.hitByPitch})`,
            stolenBases: sql<number>`sum(${batting.stolenBase})`,
            sacrifice: sql<number>`sum(${batting.sacrifice})`,
            roe: sql<number>`sum(${batting.roe})`,
            obp: sql<number>`
        round(cast(
          sum(${batting.singleHit}) + sum(${batting.doubleHit}) +
          sum(${batting.tripleHit}) + sum(${batting.homeRun}) +
          sum(${batting.walk}) + sum(${batting.hitByPitch})
        as numeric) /
        nullif(
          sum(${batting.atBat}) + sum(${batting.walk}) +
          sum(${batting.hitByPitch}) + sum(${batting.sacrifice}),
        0), 3)
      `,
            slg: sql<number>`
        round(cast(
          sum(${batting.singleHit}) +
          (sum(${batting.doubleHit}) * 2) +
          (sum(${batting.tripleHit}) * 3) +
          (sum(${batting.homeRun}) * 4)
        as numeric) /
        nullif(sum(${batting.atBat}), 0), 3)
      `,
            ops: sql<number>`
        round(cast(
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
        nullif(sum(${batting.atBat}), 0), 3)
      `,
        })
        .from(rosters)
        .innerJoin(players, eq(players.id, rosters.playerId))
        .innerJoin(batting, eq(batting.playerId, players.id))
        .innerJoin(games, eq(games.id, batting.gameId))
        .where(
            and(
                eq(rosters.teamId, id),
                sql`${rosters.activePeriod} @> ${games.date}::date`
            )
        )
        .groupBy(
            sql`extract(year from ${games.date})::int`,
            players.id,
            players.firstName,
            players.lastName
        )
        .orderBy(
            sql`extract(year from ${games.date})::int desc`,
            players.lastName,
            players.firstName
        );

    return { team, recordByYear, rosterByYear };
}

interface GetLeagueStandingsOptions {
    leagueId?: number;
    type?: StandingType;
    year?: number;
}

export async function getLeagueStandings({
    leagueId = 2,
    type = 'all',
    year = 2026,
}: GetLeagueStandingsOptions = {}) {
    const gamesQuery = db
        .select({
            homeTeamId: games.homeTeamId,
            awayTeamId: games.awayTeamId,
            homeScore: games.homeScore,
            awayScore: games.awayScore,
        })
        .from(games)
        .where(
            and(
                isNotNull(games.homeScore),
                isNotNull(games.awayScore),
                // leagueId
                //     ? eq(games.leagueId, leagueId)
                //     : sql`1=1`,
                gte(games.date, `${year}-01-01`),
                lt(games.date, `${year + 1}-01-01`),

                type === 'regular'
                    ? eq(games.isPlayoff, false)
                    : type === 'playoffs'
                        ? eq(games.isPlayoff, true)
                        : sql`1=1`,
            )
        );

    const allGames = await gamesQuery;

    console.log({
        leagueId,
        type,
        year,
        games: allGames.length,
    });

    console.log(
        allGames.filter(
            game =>
                game.homeTeamId === 1 ||
                game.awayTeamId === 1
        )
    );

    const allTeams = await db.select().from(teams);

    // Calculate overall standings.
    const standings = allTeams
        .map(team => {
            let wins = 0;
            let losses = 0;
            let ties = 0;

            allGames.forEach(game => {
                const isHome = game.homeTeamId === team.id;
                const isAway = game.awayTeamId === team.id;

                if (!isHome && !isAway) return;

                const teamScore = isHome
                    ? game.homeScore
                    : game.awayScore;

                const opponentScore = isHome
                    ? game.awayScore
                    : game.homeScore;

                if (teamScore === null || opponentScore === null) return;

                if (teamScore > opponentScore) {
                    wins++;
                } else if (teamScore < opponentScore) {
                    losses++;
                } else {
                    ties++;
                }
            });

            const gamesPlayed = wins + losses + ties;
            const winPercentage = gamesPlayed > 0
                ? (wins + ties * 0.5) / gamesPlayed
                : 0;

            return {
                ...team,
                wins,
                losses,
                ties,
                gamesPlayed,
                winPercentage,
            };
        })
        .filter(team => team.gamesPlayed > 0);

    /**
     * Calculate a team's head-to-head record against a group of teams.
     *
     * Only games where BOTH teams are members of the tied group
     * are considered.
     */
    const getHeadToHead = (
        teamId: number,
        tiedTeamIds: Set<number>
    ) => {
        let wins = 0;
        let losses = 0;
        let ties = 0;
        let runDiff = 0;

        allGames.forEach(game => {
            const isTeamHome = game.homeTeamId === teamId;
            const isTeamAway = game.awayTeamId === teamId;

            if (!isTeamHome && !isTeamAway) return;

            const opponentId = isTeamHome
                ? game.awayTeamId
                : game.homeTeamId;

            // Only consider games against another team in the tie.
            if (!tiedTeamIds.has(opponentId)) return;

            const teamScore = isTeamHome
                ? game.homeScore
                : game.awayScore;

            const opponentScore = isTeamHome
                ? game.awayScore
                : game.homeScore;

            if (teamScore === null || opponentScore === null) return;

            runDiff += teamScore - opponentScore;

            if (teamScore > opponentScore) {
                wins++;
            } else if (teamScore < opponentScore) {
                losses++;
            } else {
                ties++;
            }
        });

        return {
            wins,
            losses,
            ties,
            runDiff,
        };
    };

    /**
     * Resolve a group of teams tied on overall win percentage.
     */
    const resolveTie = <T extends (typeof standings)[number]>(
        tiedTeams: T[]
    ): T[] => {
        if (tiedTeams.length <= 1) {
            return tiedTeams;
        }

        const tiedTeamIds = new Set(
            tiedTeams.map(team => team.id)
        );

        const headToHead = new Map<
            number,
            ReturnType<typeof getHeadToHead>
        >();

        tiedTeams.forEach(team => {
            headToHead.set(
                team.id,
                getHeadToHead(team.id, tiedTeamIds)
            );
        });

        // Sort by:
        // 1. Head-to-head win percentage
        // 2. Head-to-head run differential
        //
        // Using H2H win percentage here also correctly handles
        // ties in the number of H2H games played.
        const sorted = [...tiedTeams].sort((a, b) => {
            const aH2H = headToHead.get(a.id)!;
            const bH2H = headToHead.get(b.id)!;

            const aGames = aH2H.wins + aH2H.losses + aH2H.ties;
            const bGames = bH2H.wins + bH2H.losses + bH2H.ties;

            const aWinPct = aGames > 0
                ? (aH2H.wins + aH2H.ties * 0.5) / aGames
                : 0;

            const bWinPct = bGames > 0
                ? (bH2H.wins + bH2H.ties * 0.5) / bGames
                : 0;

            // 1. Head-to-head win percentage
            if (aWinPct !== bWinPct) {
                return bWinPct - aWinPct;
            }

            // 2. Head-to-head run differential
            if (aH2H.runDiff !== bH2H.runDiff) {
                return bH2H.runDiff - aH2H.runDiff;
            }

            return 0;
        });

        return sorted;
    };

    // First sort into overall win-percentage groups.
    standings.sort((a, b) => {
        if (a.winPercentage !== b.winPercentage) {
            return b.winPercentage - a.winPercentage;
        }

        return 0;
    });

    // Resolve each group tied on overall win percentage.
    const resolvedStandings: typeof standings = [];

    for (let i = 0; i < standings.length;) {
        const currentWinPercentage = standings[i].winPercentage;

        const tiedTeams: typeof standings = [];

        while (
            i < standings.length &&
            standings[i].winPercentage === currentWinPercentage
        ) {
            tiedTeams.push(standings[i]);
            i++;
        }

        resolvedStandings.push(...resolveTie(tiedTeams));
    }

    return resolvedStandings;
}

export async function createTeam(teamName: string) {
    return db.insert(teams).values({ teamName }).returning();
}

export async function updateTeam(id: number, teamName: string) {
    return db.update(teams).set({ teamName }).where(eq(teams.id, id)).returning();
}

// Hard block on delete if the team has ever appeared in a game (home or away) —
// unlike players, this is a real guard, not a cascade. A team's game history
// is the actual season record; wiping it out from under a delete would corrupt
// standings/results for every other team that played them, which is a much
// bigger blast radius than deleting a single player's own rows.
export async function teamHasGames(id: number) {
    const [row] = await db
        .select({ id: games.id })
        .from(games)
        .where(or(eq(games.homeTeamId, id), eq(games.awayTeamId, id)))
        .limit(1);
    return !!row;
}

export async function deleteTeam(id: number) {
    return db.delete(teams).where(eq(teams.id, id)).returning();
}
