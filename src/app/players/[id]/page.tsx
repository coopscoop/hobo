import { notFound } from 'next/navigation';

import { BackButton } from '@/components/BackButton';
import { PlayerDetail } from '@/components/players/PlayerDetail';
import {
    fetchPlayerById,
    fetchPlayerStatsById,
    fetchPlayerGameLog,
} from '@/lib/services/players';

export default async function PlayerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const playerId = Number(id);

    if (!Number.isInteger(playerId)) {
        notFound();
    }

    const currentYear = new Date().getFullYear();

    const [player, statsByYear, gameLog] = await Promise.all([
        fetchPlayerById(playerId),
        fetchPlayerStatsById(playerId),
        fetchPlayerGameLog(playerId, currentYear),
    ]);

    if (!player) {
        notFound();
    }

    return (
        <>
            <BackButton />

            <PlayerDetail
                player={player}
                statsByYear={statsByYear}
                gameLog={gameLog}
                currentYear={currentYear}
            />
        </>
    );
}
