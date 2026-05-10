import { getTeamById } from '@/db/queries/teams';
import { getGameYearRange } from '@/db/queries/games';
import { TeamDetail } from '@/components/teams/TeamDetail';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, yearRange] = await Promise.all([
    getTeamById(parseInt(id)),
    getGameYearRange(),
  ]);
  if (!data) notFound();

  return (
    <>
      <BackButton />
      <TeamDetail data={data} minYear={yearRange.minYear} maxYear={yearRange.maxYear} />
    </>
  );
}
