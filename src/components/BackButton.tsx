'use client';

import { useRouter } from 'next/navigation';
import { Box, Typography } from '@mui/material';
import { ArrowBackIosNewRounded } from '@mui/icons-material';

export function BackButton() {
  const router = useRouter();

  return (
    <Box
      onClick={() => window.history.length > 1 ? router.back() : router.push('/')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        width: 'fit-content',
        '&:hover': { opacity: 0.7 },
      }}
    >
      <ArrowBackIosNewRounded fontSize="small" />
      <Typography variant="button">Back</Typography>
    </Box>
  );
}
