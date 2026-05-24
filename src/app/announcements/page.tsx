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
      <AnnouncementsTable title={"Pinned Announcements"} announcements={pinned} />
      <AnnouncementsTable title={"General Announcements"} announcements={general} />
    </>
  )
}
