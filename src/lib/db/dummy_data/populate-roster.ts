// // scripts/populate-rosters.ts - with better debugging
// import '../load-env';
// import { db } from '@/lib/db';
// import { players, games, batting, rosters } from '@/lib/db/schema';
// import { eq, and, sql, desc } from 'drizzle-orm';
//
// async function main() {
//     console.log('📊 Populating rosters from historical games...');
//
//     // First, get all distinct years from the games table
//     console.log('📅 Fetching season ranges...');
//
//     const allGames = await db
//         .select({
//             id: games.id,
//             date: games.date,
//             homeTeamId: games.homeTeamId,
//             awayTeamId: games.awayTeamId,
//         })
//         .from(games);
//
//     console.log(`   Found ${allGames.length} games`);
//
//     // Debug: show first few games
//     if (allGames.length > 0) {
//         console.log('   First 3 games:');
//         for (let i = 0; i < Math.min(3, allGames.length); i++) {
//             console.log(`     Game ${i+1}: date=${allGames[i].date}, type=${typeof allGames[i].date}`);
//         }
//     } else {
//         console.log('   ⚠️ No games found in the database!');
//         return;
//     }
//
//     // Build season map manually from the games data
//     const seasonMap = new Map<number, { firstDate: Date, lastDate: Date }>();
//
//     for (const game of allGames) {
//         // Handle date properly - it might be a string or Date object
//         let gameDate: Date;
//         if (typeof game.date === 'string') {
//             gameDate = new Date(game.date);
//         } else if (game.date instanceof Date) {
//             gameDate = game.date;
//         } else {
//             console.log(`   ⚠️ Unexpected date type: ${typeof game.date}`);
//             continue;
//         }
//
//         const year = gameDate.getFullYear();
//         console.log(`   Processing game from ${year}: ${gameDate.toISOString().split('T')[0]}`);
//
//         if (!seasonMap.has(year)) {
//             seasonMap.set(year, {
//                 firstDate: gameDate,
//                 lastDate: gameDate
//             });
//         } else {
//             const existing = seasonMap.get(year)!;
//             if (gameDate < existing.firstDate) existing.firstDate = gameDate;
//             if (gameDate > existing.lastDate) existing.lastDate = gameDate;
//         }
//     }
//
//     console.log(`   Found ${seasonMap.size} seasons`);
//     for (const [year, range] of seasonMap) {
//         console.log(`   ${year}: ${range.firstDate.toISOString().split('T')[0]} to ${range.lastDate.toISOString().split('T')[0]}`);
//     }
//
//     const allPlayers = await db.select().from(players);
//     console.log(`\n👥 Found ${allPlayers.length} players`);
//
//     let rosterEntriesCreated = 0;
//     let playersWithGames = 0;
//     let activePlayers = 0;
//
//     for (const player of allPlayers) {
//         // Get all games this player appeared in
//         const playerGames = await db
//             .select({
//                 gameId: games.id,
//                 date: games.date,
//                 homeTeamId: games.homeTeamId,
//                 awayTeamId: games.awayTeamId,
//             })
//             .from(games)
//             .innerJoin(batting, eq(batting.gameId, games.id))
//             .where(eq(batting.playerId, player.id))
//             .orderBy(desc(games.date));
//
//         if (playerGames.length === 0) continue;
//
//         playersWithGames++;
//
//         // Group games by year and team
//         const seasonTeams = new Map<string, { teamId: number, year: number }>();
//
//         for (const game of playerGames) {
//             let gameDate: Date;
//             if (typeof game.date === 'string') {
//                 gameDate = new Date(game.date);
//             } else if (game.date instanceof Date) {
//                 gameDate = game.date;
//             } else {
//                 continue;
//             }
//
//             const year = gameDate.getFullYear();
//
//             let teamId: number | null = null;
//
//             // If they have a currentTeam and it matches one of the teams, use it
//             if (player.currentTeam) {
//                 if (player.currentTeam === game.homeTeamId || player.currentTeam === game.awayTeamId) {
//                     teamId = player.currentTeam;
//                 }
//             }
//
//             // If we still don't know, check which team they played for most often in this season
//             if (!teamId) {
//                 // Get all games for this player in this year
//                 const seasonGames = playerGames.filter(g => {
//                     let d: Date;
//                     if (typeof g.date === 'string') d = new Date(g.date);
//                     else if (g.date instanceof Date) d = g.date;
//                     else return false;
//                     return d.getFullYear() === year;
//                 });
//
//                 const teamCounts = new Map<number, number>();
//                 for (const g of seasonGames) {
//                     teamCounts.set(g.homeTeamId, (teamCounts.get(g.homeTeamId) || 0) + 1);
//                     teamCounts.set(g.awayTeamId, (teamCounts.get(g.awayTeamId) || 0) + 1);
//                 }
//
//                 let maxCount = 0;
//                 for (const [tid, count] of teamCounts) {
//                     if (count > maxCount) {
//                         maxCount = count;
//                         teamId = tid;
//                     }
//                 }
//             }
//
//             // If we still don't know, use home team
//             if (!teamId) {
//                 teamId = game.homeTeamId;
//             }
//
//             const key = `${teamId}-${year}`;
//             if (!seasonTeams.has(key)) {
//                 seasonTeams.set(key, { teamId, year });
//             }
//         }
//
//         // Create roster entries for each team+year combination
//         for (const [key, { teamId, year }] of seasonTeams) {
//             // Get the season range for this year
//             const seasonRange = seasonMap.get(year);
//             if (!seasonRange) {
//                 console.log(`⚠️ No season range found for year ${year}, player ${player.id}`);
//                 continue;
//             }
//
//             const startStr = seasonRange.firstDate.toISOString().split('T')[0];
//             const endStr = seasonRange.lastDate.toISOString().split('T')[0];
//
//             // Check if roster entry already exists
//             const existing = await db
//                 .select()
//                 .from(rosters)
//                 .where(
//                     and(
//                         eq(rosters.teamId, teamId),
//                         eq(rosters.playerId, player.id),
//                         sql`${rosters.activePeriod} && daterange(${startStr}, ${endStr}, '[]')`
//                     )
//                 );
//
//             if (existing.length === 0) {
//                 try {
//                     await db.insert(rosters).values({
//                         teamId: teamId,
//                         playerId: player.id,
//                         activePeriod: `[${startStr},${endStr}]`
//                     });
//                     rosterEntriesCreated++;
//                 } catch (error) {
//                     console.log(`⚠️ Failed to insert roster for player ${player.id}, team ${teamId}, year ${year}: ${error}`);
//                 }
//             }
//         }
//
//         // Update currentTeam based on most recent game (within 30 days)
//         const mostRecentGame = playerGames[0];
//         let gameDate: Date;
//         if (typeof mostRecentGame.date === 'string') {
//             gameDate = new Date(mostRecentGame.date);
//         } else if (mostRecentGame.date instanceof Date) {
//             gameDate = mostRecentGame.date;
//         } else {
//             continue;
//         }
//
//         const thirtyDaysAgo = new Date();
//         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
//
//         if (gameDate >= thirtyDaysAgo) {
//             // Determine their team for the most recent game
//             let recentTeamId = player.currentTeam;
//             if (!recentTeamId || (recentTeamId !== mostRecentGame.homeTeamId && recentTeamId !== mostRecentGame.awayTeamId)) {
//                 recentTeamId = mostRecentGame.homeTeamId;
//             }
//
//             await db
//                 .update(players)
//                 .set({ currentTeam: recentTeamId })
//                 .where(eq(players.id, player.id));
//             activePlayers++;
//         } else {
//             // Not active in last 30 days
//             await db
//                 .update(players)
//                 .set({ currentTeam: null })
//                 .where(eq(players.id, player.id));
//         }
//     }
//
//     console.log('\n' + '='.repeat(50));
//     console.log(`✅ Roster population complete!`);
//     console.log(`   Players with games: ${playersWithGames}`);
//     console.log(`   Roster entries created: ${rosterEntriesCreated}`);
//     console.log(`   Active players (played in last 30 days): ${activePlayers}`);
//
//     // Show a sample of roster entries
//     const sample = await db
//         .select({
//             id: rosters.id,
//             teamId: rosters.teamId,
//             playerId: rosters.playerId,
//             activePeriod: rosters.activePeriod,
//         })
//         .from(rosters)
//         .limit(5);
//
//     if (sample.length > 0) {
//         console.log('\n📋 Sample roster entries:');
//         for (const entry of sample) {
//             console.log(`   Player ${entry.playerId} -> Team ${entry.teamId}: ${entry.activePeriod}`);
//         }
//     } else {
//         console.log('\n⚠️ No roster entries created. Debug info:');
//         const battingCount = await db.select({ count: sql<number>`count(*)` }).from(batting);
//         console.log(`   Batting records: ${battingCount[0].count}`);
//         const gameCount = await db.select({ count: sql<number>`count(*)` }).from(games);
//         console.log(`   Games: ${gameCount[0].count}`);
//
//         // Check player 1
//         const player1Battings = await db
//             .select({ gameId: batting.gameId })
//             .from(batting)
//             .where(eq(batting.playerId, 1))
//             .limit(5);
//         console.log(`   Player 1 batting records: ${player1Battings.length}`);
//         if (player1Battings.length > 0) {
//             console.log(`   Player 1 game IDs: ${player1Battings.map(b => b.gameId).join(', ')}`);
//         }
//     }
//
//     console.log('\n✨ All done!');
// }
//
// main()
//     .then(() => process.exit(0))
//     .catch((err) => {
//         console.error('❌ Error:', err);
//         process.exit(1);
//     });
