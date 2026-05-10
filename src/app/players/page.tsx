import { getPlayersWithStats } from '@/db/queries/players';
import { getGameYearRange } from '@/db/queries/games';
import { PlayersTable } from '@/components/players/PlayersTable';

interface PlayersPageProps {
  searchParams: Promise<{
    yearFrom?: string;
    yearTo?: string;
  }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const { yearFrom, yearTo } = await searchParams;

  const [players, yearRange] = await Promise.all([
    getPlayersWithStats({ yearFrom: yearFrom ?? null, yearTo: yearTo ?? null }),
    getGameYearRange(),
  ]);

  return (
    <PlayersTable
      players={players}
      yearFrom={yearFrom ?? ''}
      yearTo={yearTo ?? ''}
      minYear={yearRange.minYear}
      maxYear={yearRange.maxYear}
    />
  );
}
