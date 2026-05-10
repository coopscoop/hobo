import { getPlayerById, getPlayerGameLog } from '@/db/queries/players';
import { PlayerDetail } from '@/components/players/PlayerDetail';
import { notFound } from 'next/navigation';
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // const currentYear = new Date().getFullYear();
  const currentYear = 2025;
  const playerId = parseInt(id);

  const [data, gameLog] = await Promise.all([
    getPlayerById(playerId),
    getPlayerGameLog(playerId, currentYear),
  ]);

  if (!data) notFound();

  console.log('gameLog result:', JSON.stringify(gameLog, null, 2));
  console.log('getPlayerGameLog called with:', { id, currentYear });

  return (
    <>
      <BackButton />
      <PlayerDetail data={data} gameLog={gameLog} currentYear={currentYear} />
    </>
  );
}
