'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => window.history.length > 1 ? router.back() : router.push('/')}
      size="small"
    >
      Back
    </Button>
  );
}
