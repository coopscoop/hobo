import { AnnouncementsTable } from '@/components/announcements/AnnouncementsTable';

export default async function AnnouncementsPage() {
    const [pinned, general] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/pinned`).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcements/general`).then((r) => r.json()),
    ]);

    return (
        <>
            <AnnouncementsTable title={"Pinned Announcements"} announcements={pinned} />
            <AnnouncementsTable title={"General Announcements"} announcements={general} />
        </>
    )
}
