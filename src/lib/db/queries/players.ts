import 'server-only'
import { db } from '@/lib/db'
import { players, batting, pitching, games } from '@/lib/db/schema'
import { eq, sql, desc } from 'drizzle-orm'
import type { NewPlayer } from '@/lib/types'

export async function getPlayers() {
  return db.select().from(players).orderBy(players.lastName, players.firstName)
}

export async function getPlayerById(id: number) {
  const [result] = await db.select().from(players).where(eq(players.id, id))
  return result
}

export async function getPlayerNames() {
  return db.select({
    id: players.id,
    firstName: players.firstName,
    lastName: players.lastName,
    currentTeam: players.currentTeam,
  }).from(players).orderBy(players.lastName, players.firstName)
}

export async function getPlayerGameLog(playerId: number) {
  return db.select({
    gameId: games.id,
    gameDate: games.date,
    batting: batting,
    game: games,
  })
  .from(batting)
  .leftJoin(games, eq(batting.gameId, games.id))
  .where(eq(batting.playerId, playerId))
  .orderBy(desc(games.date))
}

export async function createPlayer(data: NewPlayer) {
  return db.insert(players).values(data).returning()
}

export async function updatePlayer(id: number, data: Partial<NewPlayer>) {
  return db.update(players).set(data).where(eq(players.id, id)).returning()
}

export async function deletePlayer(id: number) {
  return db.delete(players).where(eq(players.id, id))
}
