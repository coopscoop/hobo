import 'server-only'
import { db } from '@/lib/db'
import { rosters, players, teams } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { NewRoster } from '@/lib/types'

export async function getRosters() {
  return db.select({
    roster: rosters,
    player: players,
    team: teams,
  })
  .from(rosters)
  .leftJoin(players, eq(rosters.playerId, players.id))
  .leftJoin(teams, eq(rosters.teamId, teams.id))
}

export async function getRosterById(id: number) {
  const [result] = await db.select()
    .from(rosters)
    .where(eq(rosters.id, id))
  return result
}

export async function getRostersByTeam(teamId: number) {
  return db.select({
    roster: rosters,
    player: players,
  })
  .from(rosters)
  .leftJoin(players, eq(rosters.playerId, players.id))
  .where(eq(rosters.teamId, teamId))
}

export async function getRostersByPlayer(playerId: number) {
  return db.select()
    .from(rosters)
    .where(eq(rosters.playerId, playerId))
}

export async function createRoster(data: NewRoster) {
  return db.insert(rosters).values(data).returning()
}

export async function updateRoster(id: number, data: Partial<NewRoster>) {
  return db.update(rosters).set(data).where(eq(rosters.id, id)).returning()
}

export async function deleteRoster(id: number) {
  return db.delete(rosters).where(eq(rosters.id, id))
}
