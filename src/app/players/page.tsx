import { PlayersPageClient } from '@/components/players/PlayersPageClient';
import { fetchPlayersWithStats } from '@/lib/services/players';

interface PlayersPageProps {
    searchParams: Promise<{
        yearFrom?: string;
        yearTo?: string;
    }>;
}

export default async function PlayersPage({
    searchParams,
}: PlayersPageProps) {
    const { yearFrom, yearTo } = await searchParams;

    const parsedYearFrom = yearFrom
        ? Number(yearFrom)
        : undefined;

    const parsedYearTo = yearTo
        ? Number(yearTo)
        : undefined;

    const players = await fetchPlayersWithStats(
        parsedYearFrom,
        parsedYearTo,
    );

    return (
        <PlayersPageClient
            players={players}
            yearFrom={yearFrom ?? ''}
            yearTo={yearTo ?? ''}
        />
    );
}
