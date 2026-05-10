import { getGameById } from '@/db/queries/games';
import { GameDetail } from '@/components/games/GameDetail';
import { notFound } from 'next/navigation';
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getGameById(parseInt(id));
  if (!data) notFound();

  return (
    <>
      <Link href="/games" passHref>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ArrowBackIosNewRounded />
          <Typography variant="button">Back</Typography>
        </Box>
      </Link>
      <GameDetail data={data} />
    </>
  );
}
