'use client';

import { useEffect, useState } from 'react';
import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable';
import type { Announcement } from '@/types';
import { Typography } from '@mui/material';

export default function AnnouncementsPage() {
  const [pinned, setPinned] = useState<Announcement[]>([]);
  const [general, setGeneral] = useState<Announcement[]>([]);
  const [all, setAll] = useState<Announcement[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/announcements/pinned').then((r) => r.json()),
      fetch('/api/announcements/general').then((r) => r.json()),
      fetch('/api/announcements/').then((r) => r.json())
    ]).then(([pinned, general, all]) => {
      setPinned(pinned);
      setGeneral(general);
      setAll(all);
    });
  }, [])

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>Pinned Announcements</Typography>
      <AnnouncementsTable announcements={pinned} />
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>General Announcements</Typography>
      <AnnouncementsTable announcements={general} />
    </>
  )
}
