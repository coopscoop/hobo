import { db } from '@/db';
import { teams, games, players, batting, rosters } from '@/db/schema';
import { eq, or, sql, and, isNotNull } from 'drizzle-orm';

export async function getTeams() {
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
    .leftJoin(games, or(
      eq(games.homeTeamId, teams.id),
      eq(games.awayTeamId, teams.id)
    ))
    .groupBy(teams.id, teams.teamName)
    .orderBy(teams.teamName);
}

export async function getTeamById(id: number) {
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
