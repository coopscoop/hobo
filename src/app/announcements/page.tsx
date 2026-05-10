import { getAnnouncements } from '@/db/queries/announcements';
import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable';

export default async function AnnouncementsPage() {
  const data = await getAnnouncements();
  return (
    <AnnouncementsTable announcements={data} />
  )
};
