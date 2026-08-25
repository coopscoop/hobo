import { GamesPageClient } from '@/components/games/GamesPageClient';
import { CreateGameButton } from '@/components/games/CreateGameButton';

export default async function GamesPage() {
    const [games, yearRange] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/yearrange`).then((r) => r.json()),
    ]);

    return (
        <>
            <CreateGameButton />
            <GamesPageClient
                initialGames={games}
                minYear={yearRange.minYear}
                maxYear={yearRange.maxYear}
            />
        </>
    );
}
