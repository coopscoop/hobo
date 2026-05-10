import { getAnnouncements } from '@/db/queries/announcements';
import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import Link from 'next/link';
import { Box, Typography } from '@mui/material';

export default async function AnnouncementsPage() {
  const data = await getAnnouncements();
  return (
    <AnnouncementsTable announcements={data} />
  )
};
