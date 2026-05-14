import { getPlayersWithStats } from '@/db/queries/players';
import { getGameYearRange } from '@/db/queries/games';
import { PlayersTable } from '@/components/players/PlayersTable';

interface PlayersPageProps {
  searchParams: Promise<{
    yearFrom?: string;
    yearTo?: string;
  }>;
}

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ yearFrom?: string; yearTo?: string }> }) {
  const currentYear = new Date().getFullYear();
  const params = await searchParams;

  // default to current year if no year range is provided by the user
  // const yearFrom = params.yearFrom ?? String(currentYear);
  const yearFrom = 2025;
  const yearTo = params.yearTo ?? String(currentYear);

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
