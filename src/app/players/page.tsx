import { PlayersPageClient } from '@/components/players/PlayersPageClient';

interface PlayersPageProps {
  searchParams: Promise<{
    yearFrom?: string;
    yearTo?: string;
  }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const { yearFrom, yearTo } = await searchParams;

  const [players, yearRange] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players?${new URLSearchParams({
      ...(yearFrom && { yearFrom }),
      ...(yearTo   && { yearTo }),
    })}`).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/yearrange`).then((r) => r.json()),
  ]);

  return (
    <PlayersPageClient
      players={players}
      yearFrom={yearFrom ?? ''}
      yearTo={yearTo ?? ''}
      minYear={yearRange.minYear}
      maxYear={yearRange.maxYear}
    />
  );
}
