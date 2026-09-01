// app/announcements/page.tsx
import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable';
import { fetchAnnouncements } from '@/lib/services/announcements';

export default async function AnnouncementsPage() {
    const [pinned, general] = await Promise.all([
        fetchAnnouncements({ pinned: true }),
        fetchAnnouncements({ pinned: false }),
    ]);

    return (
        <>
            <AnnouncementsTable title={"Pinned Announcements"} announcements={pinned} />
            <AnnouncementsTable title={"General Announcements"} announcements={general} />
        </>
    )
}
