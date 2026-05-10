import { getGameById } from '@/db/queries/games';
import { GameDetail } from '@/components/games/GameDetail';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/BackButton';

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getGameById(parseInt(id));
  if (!data) notFound();

  return (
    <>
      <BackButton />
      <GameDetail data={data} />
    </>
  );
}
