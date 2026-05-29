import { GamesPageClient } from '@/components/games/GamesPageClient';

export default async function GamesPage() {
  const [games, yearRange] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games`).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/yearrange`).then((r) => r.json()),
  ]);

  return (
    <GamesPageClient
      initialGames={games}
      minYear={yearRange.minYear}
      maxYear={yearRange.maxYear}
    />
  );
}
