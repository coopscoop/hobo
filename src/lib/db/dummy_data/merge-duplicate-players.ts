// scripts/merge-duplicate-players.ts
import '../load-env';
import { db } from '@/lib/db';
import { players, batting } from '@/lib/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

async function main() {
    console.log('🔍 Finding duplicate players...');
    
    const duplicateGroups = await db
        .select({
            firstName: players.firstName,
            lastName: players.lastName,
            ids: sql<number[]>`array_agg(${players.id})`,
            count: sql<number>`count(*)`,
        })
        .from(players)
        .groupBy(players.firstName, players.lastName)
        .having(sql`count(*) > 1`);

    console.log(`📊 Found ${duplicateGroups.length} groups of duplicate players`);

    if (duplicateGroups.length === 0) {
        console.log('✨ No duplicates found! Nothing to do.');
        return;
    }

    let totalDuplicatesRemoved = 0;

    for (const group of duplicateGroups) {
        if (!group.firstName || !group.lastName) continue;

        const ids = group.ids.sort((a, b) => a - b);
        const survivorId = ids[0];
        const duplicateIds = ids.slice(1);

        console.log(`\n📝 Merging "${group.firstName} ${group.lastName}":`);
        console.log(`   Survivor: ID ${survivorId}`);
        console.log(`   Duplicates: ${duplicateIds.join(', ')}`);

        // Update batting records
        const battingUpdate = await db
            .update(batting)
            .set({ playerId: survivorId })
            .where(inArray(batting.playerId, duplicateIds));
        console.log(`   ✅ Updated ${battingUpdate.fields.length} batting records`);

        // Delete duplicate players
        await db
            .delete(players)
            .where(inArray(players.id, duplicateIds));
        console.log(`   ✅ Removed ${duplicateIds.length} duplicate player records`);

        totalDuplicatesRemoved += duplicateIds.length;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Merge complete!`);
    console.log(`   Total duplicates removed: ${totalDuplicatesRemoved}`);
    
    const remainingCount = await db.select({ count: sql<number>`count(*)` }).from(players);
    console.log(`   Remaining unique players: ${remainingCount[0].count}`);
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
