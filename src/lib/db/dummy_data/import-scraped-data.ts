// scripts/import-scraped-data.ts
import '../load-env';
import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '@/lib/db';
import { leagues, teams, players, games, innings, batting } from '@/lib/db/schema';

const CSV_DIR = '/home/coop/projects/hobo/scraper/data33';
const LEAGUE_NAME = '33+';

// ---------- CSV Parser ----------
function parseCsv(raw: string): Record<string, string>[] {
    const lines = raw.trim().split('\n').filter((l) => l.trim().length > 0);
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const cells = line.split(',').map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
        return row;
    });
}

function loadCsv(filename: string): Record<string, string>[] {
    const raw = readFileSync(join(CSV_DIR, filename), 'utf-8');
    return parseCsv(raw);
}

// ---------- Helpers ----------
function parseDate(d: string): string {
    const [day, month, year] = d.split('/').map((s) => s.padStart(2, '0'));
    return `${year}-${month}-${day}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
}

function normName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

// ---------- Main ----------
async function main() {
    const warnings: string[] = [];
    let battingImported = 0;
    let battingSkipped = 0;
    let battingDuplicateSkipped = 0;

    console.log('🔄 Starting clean re-import...');
    console.log('🧹 Clearing existing data...');
    
    // Clear in correct order to avoid FK violations
    await db.delete(batting);
    await db.delete(innings);
    await db.delete(games);
    await db.delete(players);
    await db.delete(teams);
    await db.delete(leagues);

    // Load CSVs
    console.log('📂 Loading CSV files...');
    const teamsCsv = loadCsv('teams.csv');
    const playersCsv = loadCsv('players.csv');
    const gamesCsv = loadCsv('games.csv');
    const inningsCsv = loadCsv('innings.csv');
    const battingCsv = loadCsv('batting.csv');

    console.log(`   Teams: ${teamsCsv.length}`);
    console.log(`   Players: ${playersCsv.length}`);
    console.log(`   Games: ${gamesCsv.length}`);
    console.log(`   Innings: ${inningsCsv.length}`);
    console.log(`   Batting: ${battingCsv.length}`);

    // ---------- 1. League ----------
    console.log('\n📋 Creating league...');
    const [league] = await db.insert(leagues).values({ leagueName: LEAGUE_NAME }).returning();
    const leagueId = league.id;

    // ---------- 2. Teams (dedupe by name) ----------
    console.log('\n🏟️  Importing teams...');
    const teamNameToNewId = new Map<string, number>();
    const teamNameToOldIds = new Map<string, string[]>();

    for (const row of teamsCsv) {
        const key = normName(row.team_name);
        if (!teamNameToOldIds.has(key)) {
            teamNameToOldIds.set(key, []);
        }
        teamNameToOldIds.get(key)!.push(row.team_id);
    }

    for (const [teamName, oldIds] of teamNameToOldIds) {
        const originalRow = teamsCsv.find((t) => normName(t.team_name) === teamName);
        if (originalRow) {
            const [inserted] = await db.insert(teams).values({ 
                teamName: originalRow.team_name 
            }).returning();
            teamNameToNewId.set(teamName, inserted.id);
        }
    }

    console.log(`   ✅ Imported ${teamNameToNewId.size} unique teams`);

    // ---------- 3. Players (dedupe by name ONLY) ----------
    console.log('\n👥 Importing players...');
    const playerNameToId = new Map<string, number>(); // <-- This is defined here!

    // First, build a set of unique player names from both players.csv and batting.csv
    const uniquePlayerNames = new Set<string>();
    
    // Add from players.csv
    for (const row of playersCsv) {
        uniquePlayerNames.add(normName(row.player_name));
    }
    
    // Add from batting.csv
    for (const row of battingCsv) {
        uniquePlayerNames.add(normName(row.player_name));
    }

    console.log(`   Found ${uniquePlayerNames.size} unique player names across both files`);

    // Import each unique player once
    for (const playerName of uniquePlayerNames) {
        // Try to find their info in players.csv first
        const playerRow = playersCsv.find((p) => normName(p.player_name) === playerName);
        
        let firstName: string;
        let lastName: string;
        let teamId: number | null = null;

        if (playerRow) {
            const split = splitName(playerRow.player_name);
            firstName = split.firstName;
            lastName = split.lastName;
            
            // Get their team
            const teamRow = teamsCsv.find((t) => t.team_id === playerRow.team_id);
            if (teamRow) {
                const teamKey = normName(teamRow.team_name);
                teamId = teamNameToNewId.get(teamKey) || null;
            }
        } else {
            // Player only appears in batting.csv
            const split = splitName(playerName);
            firstName = split.firstName;
            lastName = split.lastName;
        }

        const [inserted] = await db.insert(players).values({
            firstName,
            lastName,
            currentTeam: teamId,
        }).returning();

        playerNameToId.set(playerName, inserted.id); // <-- This populates the map
    }

    console.log(`   ✅ Imported ${playerNameToId.size} unique players`);

    // ---------- 4. Games (import ALL games, no dedupe yet) ----------
    console.log('\n⚾ Importing games...');
    const oldGameIdToNewGameId = new Map<string, number>();
    let gamesImported = 0;
    let gamesSkipped = 0;

    for (const row of gamesCsv) {
        // Skip if status isn't final
        if (row.status !== 'F') {
            warnings.push(`Game ${row.game_id} has status "${row.status}" - skipping`);
            gamesSkipped++;
            continue;
        }

        const homeTeamNewId = teamNameToNewId.get(normName(row.home_team));
        const awayTeamNewId = teamNameToNewId.get(normName(row.away_team));

        if (!homeTeamNewId || !awayTeamNewId) {
            warnings.push(`Game ${row.game_id}: Could not resolve home/away team - skipping`);
            gamesSkipped++;
            continue;
        }

        try {
            const [inserted] = await db.insert(games).values({
                date: parseDate(row.date),
                location: '',
                homeTeamId: homeTeamNewId,
                awayTeamId: awayTeamNewId,
                leagueId,
                homeScore: Number(row.home_score) || 0,
                awayScore: Number(row.away_score) || 0,
            }).returning();

            oldGameIdToNewGameId.set(row.game_id, inserted.id);
            gamesImported++;
        } catch (error) {
            warnings.push(`Game ${row.game_id}: Import failed - ${error}`);
            gamesSkipped++;
        }
    }

    console.log(`   ✅ Imported ${gamesImported} games`);
    console.log(`   ⚠️  Skipped ${gamesSkipped} games`);

    // ---------- 5. Innings ----------
    console.log('\n📊 Importing innings...');
    let inningsImported = 0;
    let inningsSkipped = 0;

    for (const row of inningsCsv) {
        const newGameId = oldGameIdToNewGameId.get(row.game_id);
        if (!newGameId) {
            warnings.push(`Inning for game ${row.game_id} skipped: game wasn't imported`);
            inningsSkipped++;
            continue;
        }

        try {
            await db.insert(innings).values({
                gameId: newGameId,
                inning: Number(row.inning),
                homeRuns: Number(row.home_runs) || 0,
                awayRuns: Number(row.away_runs) || 0,
            });
            inningsImported++;
        } catch (error) {
            warnings.push(`Inning for game ${row.game_id}, inning ${row.inning} failed: ${error}`);
            inningsSkipped++;
        }
    }

    console.log(`   ✅ Imported ${inningsImported} innings`);
    console.log(`   ⚠️  Skipped ${inningsSkipped} innings`);

    // ---------- 6. Batting (match by player name ONLY) ----------
    console.log('\n🏏 Importing batting records...');
    
    // Track unique (game_id, player_name) to avoid duplicates during import
    const seenBatting = new Set<string>();

    for (const row of battingCsv) {
        const newGameId = oldGameIdToNewGameId.get(row.game_id);
        if (!newGameId) {
            warnings.push(`Batting for game ${row.game_id} (${row.player_name}) skipped: game wasn't imported`);
            battingSkipped++;
            continue;
        }

        // Find player by name ONLY
        const normalizedName = normName(row.player_name);
        const playerId = playerNameToId.get(normalizedName); // <-- Now playerNameToId exists!

        if (!playerId) {
            warnings.push(`Batting for game ${row.game_id} (${row.player_name}) skipped: no matching player found`);
            battingSkipped++;
            continue;
        }

        // Check for duplicate (game_id, player_name) within the import
        const key = `${row.game_id}|${normalizedName}`;
        if (seenBatting.has(key)) {
            battingDuplicateSkipped++;
            continue;
        }
        seenBatting.add(key);

        try {
            await db.insert(batting).values({
                gameId: newGameId,
                playerId: playerId,
                atBat: Number(row.at_bat) || 0,
                run: Number(row.run) || 0,
                walk: Number(row.walk) || 0,
                strikeout: Number(row.strikeout) || 0,
                hitByPitch: Number(row.hit_by_pitch) || 0,
                stolenBase: Number(row.stolen_base) || 0,
                runsBattedIn: Number(row.rbi) || 0,
                sacrifice: Number(row.sacrifice) || 0,
                singleHit: Number(row.single) || 0,
                doubleHit: Number(row.double) || 0,
                tripleHit: Number(row.triple) || 0,
                homeRun: Number(row.home_run) || 0,
            });
            battingImported++;
        } catch (error: any) {
            // Check if it's a duplicate key violation
            if (error.code === '23505' || error.message?.includes('duplicate key')) {
                battingDuplicateSkipped++;
                // This is expected - just skip it
            } else {
                warnings.push(`Batting for game ${row.game_id}, player ${row.player_name} failed: ${error.message || error}`);
                battingSkipped++;
            }
        }
    }

    console.log(`   ✅ Imported ${battingImported} batting records`);
    console.log(`   ⚠️  Skipped ${battingSkipped} batting records (errors)`);
    console.log(`   🔄 Skipped ${battingDuplicateSkipped} duplicate batting records (already exist)`);

    // ---------- Summary ----------
    console.log('\n' + '='.repeat(60));
    console.log(`✅ RE-IMPORT COMPLETE!`);
    console.log('='.repeat(60));
    console.log(`   Teams:        ${teamNameToNewId.size}`);
    console.log(`   Players:      ${playerNameToId.size}`);
    console.log(`   Games:        ${gamesImported}`);
    console.log(`   Innings:      ${inningsImported}`);
    console.log(`   Batting:      ${battingImported}`);
    console.log(`   Duplicates:   ${battingDuplicateSkipped}`);
    console.log(`   Skipped:      ${battingSkipped + inningsSkipped + gamesSkipped}`);
    console.log('='.repeat(60));

    if (warnings.length > 0) {
        console.log(`\n⚠️  ${warnings.length} warnings:`);
        const showWarnings = warnings.slice(0, 20);
        showWarnings.forEach((w) => console.log(`   - ${w}`));
        if (warnings.length > 20) {
            console.log(`   ... and ${warnings.length - 20} more warnings`);
        }
    }

    console.log('\n📋 Next steps:');
    console.log('   1. Run deduplicate-games.ts');
    console.log('   2. Run merge-duplicate-players.ts');
    console.log('   3. Run populate-rosters.ts');
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    });
